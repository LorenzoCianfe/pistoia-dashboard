import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { cachedShared, TAGS } from "@/lib/cache";

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

/** Index of neighbourhoods with activity counts + the viewer's follow set (§6). */
export const getNeighborhoodsWithCounts = cache(async (userId?: string) => {
  const [list, followed] = await Promise.all([
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
  ]);
  const followedSet = new Set(followed.map((f) => f.targetId));
  return list.map((n) => ({ ...n, following: followedSet.has(n.id) }));
});

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
  ]);

  const openReports = reports.filter(
    (r) => !["risolta", "chiusa", "non_di_competenza", "duplicata"].includes(r.status),
  ).length;

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
      reports: reports.length,
      openReports,
      proposals: proposals.length,
      polls: polls.length,
      opere: opere.length,
      events: events.length,
    },
  };
}

export type NeighborhoodDetail = NonNullable<
  Awaited<ReturnType<typeof getNeighborhoodDetail>>
>;
