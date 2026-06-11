import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline } from "@/lib/demo";
import { getUnreadCount } from "./notifiche";

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
