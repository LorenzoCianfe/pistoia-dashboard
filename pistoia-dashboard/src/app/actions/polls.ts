"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";

export async function voteAction(pollId: string, optionId: string) {
  const user = await requireUser();

  const option = await prisma.pollOption.findUnique({
    where: { id: optionId },
    include: { poll: true },
  });

  if (!option || option.pollId !== pollId || !option.poll.active) {
    return { ok: false as const, error: "Sondaggio non disponibile." };
  }

  await prisma.vote.upsert({
    where: { pollId_userId: { pollId, userId: user.id } },
    create: { pollId, optionId, userId: user.id },
    update: { optionId },
  });

  revalidatePath("/sondaggi");
  return { ok: true as const };
}
