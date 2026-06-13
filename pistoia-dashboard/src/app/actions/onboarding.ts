"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { limitWrite } from "@/lib/limits";

// Onboarding "primi passi in città" (O4): persistenza del tour completato e
// della checklist nascosta. Entrambe le azioni sono idempotenti.

/** Il tour guidato è arrivato all'ultimo passo: non riproporlo più. */
export async function completeTourAction() {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "profile");
  if (!lw.ok) return { ok: false as const };

  if (!user.tourCompletedAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tourCompletedAt: new Date() },
    });
  }
  revalidatePath("/la-mia-citta");
  return { ok: true as const };
}

/** L'utente nasconde la checklist dei primi passi. */
export async function dismissOnboardingAction() {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "profile");
  if (!lw.ok) return { ok: false as const };

  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingDismissedAt: new Date() },
  });
  revalidatePath("/la-mia-citta");
  return { ok: true as const };
}
