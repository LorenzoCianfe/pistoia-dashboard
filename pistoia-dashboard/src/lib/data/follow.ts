import "server-only";
import { prisma } from "@/lib/db";

export async function isFollowing(
  userId: string,
  targetType: string,
  targetId: string,
) {
  const f = await prisma.follow.findUnique({
    where: { userId_targetType_targetId: { userId, targetType, targetId } },
    select: { id: true },
  });
  return !!f;
}

/** All target ids of a given type that a user follows (for batch lookups). */
export async function getFollowedIds(
  userId: string,
  targetType: string,
): Promise<Set<string>> {
  const rows = await prisma.follow.findMany({
    where: { userId, targetType },
    select: { targetId: true },
  });
  return new Set(rows.map((r) => r.targetId));
}

/** How many citizens follow a given target. */
export async function getFollowerCount(targetType: string, targetId: string) {
  return prisma.follow.count({ where: { targetType, targetId } });
}
