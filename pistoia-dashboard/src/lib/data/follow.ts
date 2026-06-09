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
