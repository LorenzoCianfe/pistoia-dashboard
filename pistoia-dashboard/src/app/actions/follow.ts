"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { limitWrite } from "@/lib/limits";
import { idValido } from "@/lib/token";

export type FollowTarget =
  | "neighborhood"
  | "opera"
  | "report"
  | "proposal"
  | "poll"
  | "event"
  | "organization";

const PATHS: Record<string, string[]> = {
  neighborhood: ["/la-mia-citta", "/quartieri"],
  opera: ["/opere"],
  report: ["/segnalazioni"],
  proposal: ["/proposte"],
  poll: ["/sondaggi"],
  event: ["/eventi"],
  organization: ["/eventi"],
};

/** Generic "Segui" toggle for neighborhoods, opere, reports, proposals, polls. */
export async function toggleFollowAction(targetType: FollowTarget, targetId: string) {
  const user = await requireUser();

  // `FollowTarget` è un tipo, e un tipo non attraversa la rete: una Server
  // Action è un endpoint pubblico e riceve ciò che il chiamante scrive. Senza
  // questo controllo si potevano creare righe `Follow` con un tipo inventato —
  // niente di privilegiato, ma spazzatura in una tabella che si legge per
  // capire chi segue cosa. `lib/token.ts` racconta la forma grave della stessa
  // famiglia.
  if (!(targetType in PATHS) || !idValido(targetId)) {
    return { ok: false as const, error: "Richiesta non valida." };
  }

  const lw = await limitWrite(user.id, "follow");
  if (!lw.ok) return { ok: false as const, error: lw.error };

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
