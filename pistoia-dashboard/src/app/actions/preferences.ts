"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";

export type PrefsState = { ok?: boolean } | undefined;

export async function updateNotifPrefsAction(
  _prev: PrefsState,
  formData: FormData,
): Promise<PrefsState> {
  const user = await requireUser();
  const data = {
    neighborhood: formData.get("neighborhood") === "on",
    followedItems: formData.get("followedItems") === "on",
    polls: formData.get("polls") === "on",
    proposals: formData.get("proposals") === "on",
    generalDiscussions: formData.get("generalDiscussions") === "on",
    urgent: formData.get("urgent") === "on",
  };
  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });
  revalidatePath("/impostazioni");
  return { ok: true };
}
