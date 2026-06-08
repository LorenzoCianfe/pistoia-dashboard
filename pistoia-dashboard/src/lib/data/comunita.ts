import "server-only";
import { prisma } from "@/lib/db";

export async function getCommunityFeed(userId: string) {
  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      answer: true,
      comments: { orderBy: { createdAt: "asc" } },
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    authorName: p.authorName,
    authorInitials: p.authorInitials,
    authorColor: p.authorColor,
    content: p.content,
    category: p.category,
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
