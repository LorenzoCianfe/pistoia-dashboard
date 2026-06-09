import "server-only";
import { prisma } from "@/lib/db";

export async function getProfileStats(userId: string) {
  const [votes, posts, likes, follows, generalFollows, reports, proposals, confirmations] =
    await Promise.all([
      prisma.vote.count({ where: { userId } }),
      prisma.communityPost.count({ where: { authorId: userId } }),
      prisma.postLike.count({ where: { userId } }),
      prisma.assessoreFollow.count({ where: { userId } }),
      prisma.follow.count({ where: { userId } }),
      prisma.report.count({ where: { authorId: userId } }),
      prisma.proposal.count({ where: { authorId: userId } }),
      prisma.reportConfirmation.count({ where: { userId } }),
    ]);
  return {
    votes,
    posts,
    likes,
    follows: follows + generalFollows,
    reports,
    proposals,
    confirmations,
  };
}

/** Badges, verification requests and org profile for the profile page. */
export async function getProfileExtras(userId: string) {
  const [badges, verifications, organization, neighborhood] = await Promise.all([
    prisma.citizenBadge.findMany({
      where: { userId },
      orderBy: { issuedAt: "asc" },
    }),
    prisma.profileVerification.findMany({
      where: { userId },
      orderBy: { requestedAt: "desc" },
    }),
    prisma.organizationProfile.findUnique({ where: { userId } }),
    prisma.user
      .findUnique({ where: { id: userId }, select: { neighborhood: { select: { name: true } } } })
      .then((u) => u?.neighborhood?.name ?? null),
  ]);
  return { badges, verifications, organization, neighborhoodName: neighborhood };
}
