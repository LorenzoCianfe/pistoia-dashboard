import "server-only";
import { prisma } from "@/lib/db";
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
      comments: { orderBy: { createdAt: "asc" } },
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  });

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
    answer: p.answer,
    comments: p.comments,
    likeCount: p.baseLikes + p._count.likes,
    likedByMe: p.likes.length > 0,
    isMine: p.authorId === userId,
  }));
}

export type FeedPost = Awaited<ReturnType<typeof getCommunityFeed>>[number];
