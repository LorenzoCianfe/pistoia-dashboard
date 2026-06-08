import "server-only";
import { prisma } from "@/lib/db";

export async function getProfileStats(userId: string) {
  const [votes, posts, likes, follows] = await Promise.all([
    prisma.vote.count({ where: { userId } }),
    prisma.communityPost.count({ where: { authorId: userId } }),
    prisma.postLike.count({ where: { userId } }),
    prisma.assessoreFollow.count({ where: { userId } }),
  ]);
  return { votes, posts, likes, follows };
}
