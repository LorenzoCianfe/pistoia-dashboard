"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { limitWrite } from "@/lib/limits";

/** Where an official answer lives: a community-post answer, a proposal reply, a report timeline. */
export type FeedbackTarget = "post_answer" | "proposal" | "report";

/**
 * "Questa risposta ti è stata utile?" (§8). Records a per-user helpful/not-helpful
 * vote on an official Comune answer. Clicking the same choice again clears the vote.
 */
export async function answerFeedbackAction(
  targetType: FeedbackTarget,
  targetId: string,
  helpful: boolean,
) {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "feedback");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const key = { targetType_targetId_userId: { targetType, targetId, userId: user.id } };
  const existing = await prisma.answerFeedback.findUnique({ where: key });

  if (existing && existing.helpful === helpful) {
    await prisma.answerFeedback.delete({ where: { id: existing.id } });
  } else {
    await prisma.answerFeedback.upsert({
      where: key,
      create: { targetType, targetId, userId: user.id, helpful },
      update: { helpful },
    });
  }

  if (targetType === "post_answer") revalidatePath("/comunita");
  if (targetType === "proposal") revalidatePath(`/proposte/${targetId}`);
  if (targetType === "report") revalidatePath(`/segnalazioni/${targetId}`);
  return { ok: true as const };
}
