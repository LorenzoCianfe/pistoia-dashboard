import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { cachedShared, TAGS } from "@/lib/cache";
import {
  STATI_CHIUSI,
  STATI_FUORI_CONTEGGIO,
  STATI_RISOLTI,
  tassoRisoluzione,
} from "@/lib/citystats";

/**
 * All neighbourhoods/frazioni, ordered for menus and filters.
 * Lista statica e condivisa: cache a tag (oltre al dedupe per-render).
 */
export const getNeighborhoods = cache(
  cachedShared(
    async () => {
      return prisma.neighborhood.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, kind: true },
      });
    },
    "neighborhoods-list",
    [TAGS.quartieri],
    3600,
  ),
);

export type NeighborhoodOption = Awaited<
  ReturnType<typeof getNeighborhoods>
>[number];

export const getNeighborhoodBySlug = cache(async (slug: string) => {
  return prisma.neighborhood.findUnique({ where: { slug } });
});

/**
 * Index of neighbourhoods with activity counts + the viewer's follow set (§6).
 *
 * Porta anche il **tasso di risoluzione per quartiere**, che è ciò che tinge la
 * superficie mesh di ogni card: la tinta codifica un dato (DESIGN.md §8) e
 * questo è l'unico dato di quartiere che sia davvero una *salute*. L'attività —
 * quante segnalazioni, quanti post — non lo è: un quartiere tranquillo non è
 * malato, e colorarlo di rosso sarebbe un allarme inventato.
 *
 * La definizione del tasso è condivisa con "Stato della città"
 * (`lib/citystats.ts`): due definizioni dello stesso indicatore darebbero due
 * percentuali diverse per la stessa città, su due pagine a un clic di distanza.
 */
export const getNeighborhoodsWithCounts = cache(async (userId?: string) => {
  const [list, followed, risolte, conteggiabili] = await Promise.all([
    prisma.neighborhood.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { reports: true, posts: true, proposals: true, opere: true, events: true },
        },
      },
    }),
    userId
      ? prisma.follow.findMany({
          where: { userId, targetType: "neighborhood" },
          select: { targetId: true },
        })
      : Promise.resolve([] as { targetId: string }[]),
    prisma.report.groupBy({
      by: ["neighborhoodId"],
      where: { status: { in: [...STATI_RISOLTI] } },
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ["neighborhoodId"],
      where: { status: { notIn: [...STATI_FUORI_CONTEGGIO] } },
      _count: { _all: true },
    }),
  ]);

  const followedSet = new Set(followed.map((f) => f.targetId));
  const perId = (rows: typeof risolte) =>
    new Map(rows.flatMap((r) => (r.neighborhoodId ? [[r.neighborhoodId, r._count._all]] : [])));
  const risoltePer = perId(risolte);
  const conteggiabiliPer = perId(conteggiabili);

  return list.map((n) => ({
    ...n,
    following: followedSet.has(n.id),
    segnalazioni: {
      risolte: risoltePer.get(n.id) ?? 0,
      conteggiabili: conteggiabiliPer.get(n.id) ?? 0,
      /** 0–100, oppure `null` se non c'è ancora niente da contare. */
      tassoRisoluzione: tassoRisoluzione(
        risoltePer.get(n.id) ?? 0,
        conteggiabiliPer.get(n.id) ?? 0,
      ),
    },
  }));
});

export type NeighborhoodWithCounts = Awaited<
  ReturnType<typeof getNeighborhoodsWithCounts>
>[number];

/** Everything happening in one neighbourhood (§6): reports, posts, proposals, polls, opere, events. */
export async function getNeighborhoodDetail(slug: string, userId: string) {
  const n = await prisma.neighborhood.findUnique({ where: { slug } });
  if (!n) return null;

  const sinceYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [
    reports,
    posts,
    proposals,
    polls,
    opere,
    events,
    following,
    followerCount,
    totReports,
    openReports,
    risolte,
    conteggiabili,
    totProposals,
    totPolls,
    totOpere,
    totEvents,
  ] = await Promise.all([
    prisma.report.findMany({
      where: { neighborhoodId: n.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.communityPost.findMany({
      where: { neighborhoodId: n.id, hidden: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.proposal.findMany({
      where: { neighborhoodId: n.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.poll.findMany({
      where: { neighborhoodId: n.id, active: true },
      take: 5,
    }),
    prisma.opera.findMany({
      where: { neighborhoodId: n.id },
      orderBy: [{ featured: "desc" }, { progress: "desc" }],
      take: 5,
    }),
    prisma.event.findMany({
      where: { neighborhoodId: n.id, status: "published", startAt: { gte: sinceYesterday } },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
    prisma.follow.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType: "neighborhood", targetId: n.id },
      },
      select: { id: true },
    }),
    prisma.follow.count({ where: { targetType: "neighborhood", targetId: n.id } }),
    /*
      I conteggi si chiedono al database, NON si ricavano dalle liste qui sopra.

      Le liste sono troncate — `take: 6` sulle segnalazioni, `take: 5` sul
      resto — perché servono a mostrare le ultime, non a contare. Contarle
      dava un numero che non poteva superare il `take`: un quartiere con
      quaranta segnalazioni aperte ne dichiarava sei, e la cifra sembrava
      giusta perché era plausibile. È lo stesso genere di difetto silenzioso
      raccolto in AGENTS.md §3: nessun errore, solo un dato sbagliato.
    */
    prisma.report.count({ where: { neighborhoodId: n.id } }),
    prisma.report.count({
      where: { neighborhoodId: n.id, status: { notIn: [...STATI_CHIUSI] } },
    }),
    prisma.report.count({
      where: { neighborhoodId: n.id, status: { in: [...STATI_RISOLTI] } },
    }),
    prisma.report.count({
      where: { neighborhoodId: n.id, status: { notIn: [...STATI_FUORI_CONTEGGIO] } },
    }),
    prisma.proposal.count({ where: { neighborhoodId: n.id } }),
    prisma.poll.count({ where: { neighborhoodId: n.id, active: true } }),
    prisma.opera.count({ where: { neighborhoodId: n.id } }),
    prisma.event.count({
      where: {
        neighborhoodId: n.id,
        status: "published",
        startAt: { gte: sinceYesterday },
      },
    }),
  ]);

  return {
    neighborhood: n,
    reports,
    posts,
    proposals,
    polls,
    opere,
    events,
    following: !!following,
    followerCount,
    counts: {
      reports: totReports,
      openReports,
      proposals: totProposals,
      polls: totPolls,
      opere: totOpere,
      events: totEvents,
    },
    /** Stessa definizione di "Stato della città" e della lista quartieri. */
    segnalazioni: {
      risolte,
      conteggiabili,
      tassoRisoluzione: tassoRisoluzione(risolte, conteggiabili),
    },
  };
}

export type NeighborhoodDetail = NonNullable<
  Awaited<ReturnType<typeof getNeighborhoodDetail>>
>;
