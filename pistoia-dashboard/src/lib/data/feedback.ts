import "server-only";
import { prisma } from "@/lib/db";

/** Helpfulness summary for an official answer (§8): total "useful" votes + my vote. */
export async function getAnswerFeedback(
  targetType: string,
  targetId: string,
  userId: string,
) {
  const [helpfulCount, mine] = await Promise.all([
    prisma.answerFeedback.count({ where: { targetType, targetId, helpful: true } }),
    prisma.answerFeedback.findUnique({
      where: { targetType_targetId_userId: { targetType, targetId, userId } },
      select: { helpful: true },
    }),
  ]);
  return { helpfulCount, myVote: mine ? mine.helpful : null };
}
