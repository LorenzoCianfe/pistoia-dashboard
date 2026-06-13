"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireVerified } from "@/lib/auth/dal";
import { publicNameOf } from "@/lib/community";
import { checkContribution } from "@/lib/moderation";
import { limitWrite } from "@/lib/limits";

// Azioni dell'Ondata 4 "Territorio & partecipazione": question time,
// vota la priorità, adesione alle iniziative di volontariato.

const questionSchema = z
  .string()
  .trim()
  .min(10, "La domanda è troppo corta: almeno 10 caratteri.")
  .max(400, "La domanda è troppo lunga: massimo 400 caratteri.");

export type QuestionActionState = { ok?: boolean; error?: string } | undefined;

/** Fai una domanda in una sessione di question time aperta (A2 §22). */
export async function askQuestionAction(
  sessionId: string,
  _prev: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  const user = await requireUser();

  const parsed = questionSchema.safeParse(formData.get("body"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const lw = await limitWrite(user.id, "question");
  if (!lw.ok) return { error: lw.error };

  const check = await checkContribution(user.id, parsed.data);
  if (!check.ok) return { error: check.error };

  const session = await prisma.questionTime.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true },
  });
  if (!session || session.status !== "aperto") {
    return { error: "Questa sessione non accetta più domande." };
  }

  await prisma.qtQuestion.create({
    data: {
      sessionId,
      authorId: user.id,
      authorName: publicNameOf(user.name, user.publicName),
      body: parsed.data,
    },
  });

  revalidatePath("/question-time");
  return { ok: true };
}

/** Vota / togli il voto a una domanda del question time. */
export async function toggleQtVoteAction(questionId: string) {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "vote");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const question = await prisma.qtQuestion.findUnique({
    where: { id: questionId },
    select: { id: true, session: { select: { status: true } } },
  });
  if (!question || question.session.status !== "aperto") {
    return { ok: false as const, error: "La votazione di questa sessione è chiusa." };
  }

  const existing = await prisma.qtVote.findUnique({
    where: { questionId_userId: { questionId, userId: user.id } },
  });
  if (existing) {
    await prisma.qtVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.qtVote.create({ data: { questionId, userId: user.id } });
  }

  revalidatePath("/question-time");
  return { ok: true as const, voted: !existing };
}

/**
 * "Vota la priorità" (A2 §9): un voto per tornata, riservato ai profili
 * verificati (gli interventi sono già validati dagli uffici). Rivotare
 * un'altra voce sposta il voto.
 */
export async function votePriorityAction(roundId: string, itemId: string) {
  const user = await requireVerified();

  const lw = await limitWrite(user.id, "vote");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const item = await prisma.priorityItem.findUnique({
    where: { id: itemId },
    select: { id: true, roundId: true, round: { select: { status: true } } },
  });
  if (!item || item.roundId !== roundId || item.round.status !== "aperta") {
    return { ok: false as const, error: "Questa tornata di voto è chiusa." };
  }

  const existing = await prisma.priorityVote.findUnique({
    where: { roundId_userId: { roundId, userId: user.id } },
  });
  if (existing?.itemId === itemId) {
    // Stesso intervento: il secondo clic ritira il voto.
    await prisma.priorityVote.delete({ where: { id: existing.id } });
    revalidatePath("/priorita");
    return { ok: true as const, votedItemId: null };
  }
  if (existing) await prisma.priorityVote.delete({ where: { id: existing.id } });
  await prisma.priorityVote.create({ data: { roundId, itemId, userId: user.id } });

  revalidatePath("/priorita");
  return { ok: true as const, votedItemId: itemId };
}

/** Aderisci / ritira l'adesione a un'iniziativa di volontariato (A2 §14). */
export async function toggleInitiativeJoinAction(initiativeId: string) {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "join");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const initiative = await prisma.initiative.findUnique({
    where: { id: initiativeId },
    select: {
      id: true,
      status: true,
      spots: true,
      baseJoins: true,
      _count: { select: { joins: true } },
    },
  });
  if (!initiative) return { ok: false as const };

  const existing = await prisma.initiativeJoin.findUnique({
    where: { initiativeId_userId: { initiativeId, userId: user.id } },
  });

  if (existing) {
    await prisma.initiativeJoin.delete({ where: { id: existing.id } });
    revalidatePath("/iniziative");
    return { ok: true as const, joined: false };
  }

  if (initiative.status !== "aperta") {
    return { ok: false as const, error: "Le adesioni per questa iniziativa sono chiuse." };
  }
  const taken = initiative.baseJoins + initiative._count.joins;
  if (initiative.spots !== null && taken >= initiative.spots) {
    return { ok: false as const, error: "I posti disponibili sono esauriti." };
  }

  await prisma.initiativeJoin.create({ data: { initiativeId, userId: user.id } });
  revalidatePath("/iniziative");
  return { ok: true as const, joined: true };
}
