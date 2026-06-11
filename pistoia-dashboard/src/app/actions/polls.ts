"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { limitWrite } from "@/lib/limits";

export async function voteAction(pollId: string, optionId: string) {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "vote");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const option = await prisma.pollOption.findUnique({
    where: { id: optionId },
    include: { poll: true },
  });

  if (!option || option.pollId !== pollId || !option.poll.active) {
    return { ok: false as const, error: "Sondaggio non disponibile." };
  }

  // Official consultations are reserved to verified citizens (§5 access table).
  if (option.poll.requiresVerified && !user.verifiedType) {
    return {
      ok: false as const,
      error: "Questa consultazione è riservata ai profili verificati.",
    };
  }

  await prisma.vote.upsert({
    where: { pollId_userId: { pollId, userId: user.id } },
    create: { pollId, optionId, userId: user.id },
    update: { optionId },
  });

  revalidatePath("/sondaggi");
  return { ok: true as const };
}
