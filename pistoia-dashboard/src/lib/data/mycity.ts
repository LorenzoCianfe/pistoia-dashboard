import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline } from "@/lib/demo";
import { getUnreadCount } from "./notifiche";
import {
  matchTopic,
  topicCategories,
  type CivicTopicKey,
} from "@/lib/civic-topics";

const NOT_OPEN = ["risolta", "chiusa", "non_di_competenza", "duplicata"];

/** Personalised "La mia città" summary: what's happening near the citizen. */
export async function getMyCity(user: { id: string; neighborhoodId: string | null }) {
  const nbId = user.neighborhoodId ?? undefined;
  const scope = nbId ? { neighborhoodId: nbId } : {};

  const [
    neighborhood,
    nearbyReports,
    nearbyOpenReports,
    myOpenReports,
    activePolls,
    proposalsSupported,
    trendingRaw,
    unread,
  ] = await Promise.all([
    nbId
      ? prisma.neighborhood.findUnique({ where: { id: nbId }, select: { name: true } })
      : Promise.resolve(null),
    prisma.report.findMany({
      where: { ...scope, status: { notIn: ["chiusa"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { confirmations: true } } },
    }),
    prisma.report.count({ where: { ...scope, status: { notIn: NOT_OPEN } } }),
    prisma.report.count({
      where: { authorId: user.id, status: { notIn: ["risolta", "chiusa"] } },
    }),
    prisma.poll.count({ where: { active: true } }),
    prisma.proposalSupport.count({ where: { userId: user.id } }),
    prisma.proposal.findMany({
      where: { status: { notIn: ["respinta"] } },
      take: 30,
      include: {
        _count: { select: { supports: true } },
        supports: { where: { userId: user.id }, select: { id: true } },
      },
    }),
    getUnreadCount(user.id),
  ]);

  const trending = trendingRaw
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      supports: demoBaseline(p.baseSupports) + p._count.supports,
      supportedByMe: p.supports.length > 0,
    }))
    .sort((a, b) => b.supports - a.supports)
    .slice(0, 3);

  return {
    neighborhoodName: neighborhood?.name ?? null,
    summary: { nearbyOpenReports, myOpenReports, activePolls, proposalsSupported },
    nearbyReports: nearbyReports.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      confirmations: demoBaseline(r.baseConfirmations) + r._count.confirmations,
      createdAt: r.createdAt,
    })),
    trending,
    unread,
  };
}

export type MyCity = Awaited<ReturnType<typeof getMyCity>>;

// ---------------------------------------------------------------------------
// Feed "Per te" (A2 §3): contenuti recenti sui temi scelti dall'utente.
// ---------------------------------------------------------------------------

export type ForYouItem = {
  kind: "report" | "proposal" | "event" | "opera";
  id: string;
  title: string;
  category: string | null;
  /** Il tema dell'utente che ha fatto entrare il contenuto nel feed. */
  topic: CivicTopicKey;
  href: string;
  date: Date;
};

const FOR_YOU_PER_KIND = 5;
const FOR_YOU_TOTAL = 6;

export async function getForYou(interests: CivicTopicKey[]): Promise<ForYouItem[]> {
  if (interests.length === 0) return [];

  const cats = (kind: Parameters<typeof topicCategories>[1]) => [
    ...new Set(interests.flatMap((k) => topicCategories(k, kind))),
  ];
  const reportCats = cats("report");
  const proposalCats = cats("proposal");
  const eventCats = cats("event");
  const operaCats = cats("opera");

  const [reports, proposals, events, opere] = await Promise.all([
    reportCats.length
      ? prisma.report.findMany({
          where: { category: { in: reportCats }, status: { notIn: ["chiusa", "duplicata"] } },
          select: { id: true, title: true, category: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: FOR_YOU_PER_KIND,
        })
      : Promise.resolve([]),
    proposalCats.length
      ? prisma.proposal.findMany({
          where: { category: { in: proposalCats }, status: { notIn: ["respinta"] } },
          select: { id: true, title: true, category: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: FOR_YOU_PER_KIND,
        })
      : Promise.resolve([]),
    eventCats.length
      ? prisma.event.findMany({
          where: { category: { in: eventCats }, status: "published", startAt: { gte: new Date() } },
          select: { id: true, title: true, category: true, startAt: true },
          orderBy: { startAt: "asc" },
          take: FOR_YOU_PER_KIND,
        })
      : Promise.resolve([]),
    operaCats.length
      ? prisma.opera.findMany({
          where: { category: { in: operaCats }, status: { in: ["in_corso", "pianificata"] } },
          select: { id: true, name: true, category: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: FOR_YOU_PER_KIND,
        })
      : Promise.resolve([]),
  ]);

  const items: ForYouItem[] = [];
  for (const r of reports) {
    const topic = matchTopic(interests, "report", r.category);
    if (topic)
      items.push({
        kind: "report",
        id: r.id,
        title: r.title,
        category: r.category,
        topic,
        href: `/segnalazioni/${r.id}`,
        date: r.createdAt,
      });
  }
  for (const p of proposals) {
    const topic = matchTopic(interests, "proposal", p.category);
    if (topic)
      items.push({
        kind: "proposal",
        id: p.id,
        title: p.title,
        category: p.category,
        topic,
        href: `/proposte/${p.id}`,
        date: p.createdAt,
      });
  }
  for (const e of events) {
    const topic = matchTopic(interests, "event", e.category);
    if (topic)
      items.push({
        kind: "event",
        id: e.id,
        title: e.title,
        category: e.category,
        topic,
        href: "/eventi",
        date: e.startAt,
      });
  }
  for (const o of opere) {
    const topic = matchTopic(interests, "opera", o.category);
    if (topic)
      items.push({
        kind: "opera",
        id: o.id,
        title: o.name,
        category: o.category,
        topic,
        href: `/opere/${o.id}`,
        date: o.createdAt,
      });
  }

  // Gli eventi futuri hanno date più avanti nel tempo: l'ordinamento
  // decrescente li porta naturalmente in cima, poi il resto per freschezza.
  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, FOR_YOU_TOTAL);
}
