"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { limitWrite } from "@/lib/limits";

export async function toggleFollowAction(assessoreId: string) {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "follow");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const existing = await prisma.assessoreFollow.findUnique({
    where: { assessoreId_userId: { assessoreId, userId: user.id } },
  });

  if (existing) {
    await prisma.assessoreFollow.delete({ where: { id: existing.id } });
  } else {
    const a = await prisma.assessore.findUnique({
      where: { id: assessoreId },
      select: { id: true },
    });
    if (!a) return { ok: false as const };
    await prisma.assessoreFollow.create({
      data: { assessoreId, userId: user.id },
    });
  }

  revalidatePath("/organigramma");
  revalidatePath("/sondaggi");
  return { ok: true as const, following: !existing };
}
