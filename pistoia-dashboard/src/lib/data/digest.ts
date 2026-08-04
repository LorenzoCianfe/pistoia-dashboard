import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline } from "@/lib/demo";
import { serviziDi } from "@/lib/valutazioni";
import { getScheda } from "@/lib/data/valutazioni";

// Civic digest pubblico mensile (A2 §19): il riepilogo della città calcolato
// dai dati reali della piattaforma sugli ultimi 30 giorni. Niente cache: i
// numeri devono coincidere con quelli delle altre pagine in ogni momento.

const DAYS = 30;

export async function getMonthlyDigest() {
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

  const [
    reportsReceived,
    reportsResolved,
    reportsConfirmedByCitizens,
    topReportCategories,
    operaUpdates,
    opereInCorso,
    proposalsNew,
    proposalsAnswered,
    topProposalsRaw,
    decisions,
    activePollCount,
    upcomingEvents,
    postsCount,
  ] = await Promise.all([
    prisma.report.count({ where: { createdAt: { gte: since } } }),
    prisma.report.count({ where: { resolvedAt: { gte: since } } }),
    prisma.report.count({
      where: { resolutionFeedback: "confermata", resolutionFeedbackAt: { gte: since } },
    }),
    prisma.report.groupBy({
      by: ["category"],
      where: { createdAt: { gte: since } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 3,
    }),
    prisma.operaUpdate.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "desc" },
      take: 5,
      include: { opera: { select: { id: true, name: true } } },
    }),
    prisma.opera.count({ where: { status: "in_corso" } }),
    prisma.proposal.count({ where: { createdAt: { gte: since } } }),
    prisma.proposal.count({ where: { officialReplyAt: { gte: since } } }),
    prisma.proposal.findMany({
      where: { status: { notIn: ["respinta", "bozza"] } },
      take: 30,
      include: { _count: { select: { supports: true } } },
    }),
    prisma.decision.findMany({
      where: { decidedAt: { gte: since } },
      orderBy: { decidedAt: "desc" },
      select: { id: true, title: true, outcome: true, decidedAt: true },
    }),
    prisma.poll.count({ where: { active: true } }),
    prisma.event.findMany({
      where: { status: "published", startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      take: 4,
      select: { id: true, title: true, startAt: true, location: true },
    }),
    prisma.communityPost.count({ where: { createdAt: { gte: since }, hidden: false } }),
  ]);

  const topProposals = topProposalsRaw
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      supports: demoBaseline(p.baseSupports) + p._count.supports,
    }))
    .sort((a, b) => b.supports - a.supports)
    .slice(0, 3);

  /*
    Il blocco delle Valutazioni (R-5, C1): prima il dato, poi l'invito.
    I numeri vengono da `getScheda`, la stessa fonte delle schede — una
    definizione sola per indicatore (AGENTS §3, ondata 7): se il digest
    calcolasse da sé, prima o poi direbbe una cifra diversa dalla scheda a
    un clic di distanza.
  */
  const [valutazioniEntrate, condizioni] = await Promise.all([
    prisma.valutazione.count({
      where: { createdAt: { gte: since }, rimossaIl: null },
    }),
    Promise.all(serviziDi("condizione").map((s) => getScheda(s))),
  ]);

  return {
    periodDays: DAYS,
    generatedAt: new Date(),
    valutazioni: {
      entrate: valutazioniEntrate,
      condizioni: condizioni.map((c) => ({
        id: c.servizio.id,
        nome: c.servizio.nome,
        materia: c.servizio.materia ?? `su ${c.servizio.nome}`,
        media: c.media,
        /** `null` anche quando le chiuse sono troppo poche: mai una sintesi
         *  su un campione che non la regge. */
        giorniMediani: c.colonna?.giorniMediani ?? null,
      })),
    },
    reports: {
      received: reportsReceived,
      resolved: reportsResolved,
      confirmedByCitizens: reportsConfirmedByCitizens,
      topCategories: topReportCategories.map((c) => ({
        category: c.category,
        count: c._count.category,
      })),
    },
    opere: { updates: operaUpdates, inCorso: opereInCorso },
    proposals: { new: proposalsNew, answered: proposalsAnswered, top: topProposals },
    decisions,
    polls: { active: activePollCount },
    events: upcomingEvents,
    community: { posts: postsCount },
  };
}

export type MonthlyDigest = Awaited<ReturnType<typeof getMonthlyDigest>>;
