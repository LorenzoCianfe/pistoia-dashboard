"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";

export type FollowTarget = "neighborhood" | "opera" | "report" | "proposal" | "poll";

const PATHS: Record<string, string[]> = {
  neighborhood: ["/la-mia-citta"],
  opera: ["/opere"],
  report: ["/segnalazioni"],
  proposal: ["/proposte"],
  poll: ["/sondaggi"],
};

/** Generic "Segui" toggle for neighborhoods, opere, reports, proposals, polls. */
export async function toggleFollowAction(targetType: FollowTarget, targetId: string) {
  const user = await requireUser();
  const existing = await prisma.follow.findUnique({
    where: {
      userId_targetType_targetId: { userId: user.id, targetType, targetId },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { userId: user.id, targetType, targetId },
    });
  }

  for (const p of PATHS[targetType] ?? []) revalidatePath(p);
  revalidatePath("/la-mia-citta");
  return { ok: true as const, following: !existing };
}
