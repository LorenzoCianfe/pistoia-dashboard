import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline } from "@/lib/demo";
import type { Prisma } from "@/generated/prisma/client";

export type FeedFilter = { kind?: string; neighborhoodId?: string };

export async function getCommunityFeed(userId: string, filter?: FeedFilter) {
  const where: Prisma.CommunityPostWhereInput = { hidden: false };
  if (filter?.kind) where.kind = filter.kind;
  if (filter?.neighborhoodId) where.neighborhoodId = filter.neighborhoodId;

  const posts = await prisma.communityPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      answer: true,
      neighborhood: { select: { name: true } },
      author: { select: { verifiedType: true } },
      comments: { where: { hidden: false }, orderBy: { createdAt: "asc" } },
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  });

  // Helpfulness feedback (§8) for the official answers in this feed.
  const answerIds = posts.map((p) => p.answer?.id).filter((id): id is string => !!id);
  const [helpfulCounts, myVotes] = await Promise.all([
    answerIds.length
      ? prisma.answerFeedback.groupBy({
          by: ["targetId"],
          where: { targetType: "post_answer", targetId: { in: answerIds }, helpful: true },
          _count: true,
        })
      : Promise.resolve([] as { targetId: string; _count: number }[]),
    answerIds.length
      ? prisma.answerFeedback.findMany({
          where: { targetType: "post_answer", targetId: { in: answerIds }, userId },
          select: { targetId: true, helpful: true },
        })
      : Promise.resolve([] as { targetId: string; helpful: boolean }[]),
  ]);
  const helpfulMap = new Map(helpfulCounts.map((g) => [g.targetId, g._count]));
  const myVoteMap = new Map(myVotes.map((v) => [v.targetId, v.helpful]));

  return posts.map((p) => ({
    id: p.id,
    kind: p.kind,
    authorName: p.authorName,
    authorInitials: p.authorInitials,
    authorColor: p.authorColor,
    authorVerifiedType: p.author?.verifiedType ?? null,
    content: p.content,
    category: p.category,
    neighborhoodName: p.neighborhood?.name ?? null,
    imageSeed: p.imageSeed,
    createdAt: p.createdAt,
    answer: p.answer
      ? {
          ...p.answer,
          helpfulCount: helpfulMap.get(p.answer.id) ?? 0,
          myVote: myVoteMap.has(p.answer.id) ? myVoteMap.get(p.answer.id)! : null,
        }
      : null,
    comments: p.comments,
    likeCount: demoBaseline(p.baseLikes) + p._count.likes,
    likedByMe: p.likes.length > 0,
    isMine: p.authorId === userId,
  }));
}

export type FeedPost = Awaited<ReturnType<typeof getCommunityFeed>>[number];
