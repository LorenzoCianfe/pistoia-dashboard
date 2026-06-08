import "server-only";
import { prisma } from "@/lib/db";

export async function getAdminData() {
  const [unanswered, answeredCount, opere, pollCount, userCount] =
    await Promise.all([
      prisma.communityPost.findMany({
        where: { answer: null },
        orderBy: { createdAt: "desc" },
      }),
      prisma.officialAnswer.count(),
      prisma.opera.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, progress: true, status: true },
      }),
      prisma.poll.count({ where: { active: true } }),
      prisma.user.count(),
    ]);

  return { unanswered, answeredCount, opere, pollCount, userCount };
}

export type AdminData = Awaited<ReturnType<typeof getAdminData>>;
