"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { destroyCurrentSession } from "@/lib/auth/session";

/** Toggle the citizen's geolocation consent (§23). */
export async function setGeoConsentAction(value: boolean) {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { geoConsent: value } });
  revalidatePath("/impostazioni");
  return { ok: true as const, value };
}

/** Export all personal data as JSON (GDPR portability, §23). Never includes the password hash. */
export async function exportMyDataAction() {
  const user = await requireUser();
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      reports: true,
      proposals: true,
      proposalSupports: true,
      posts: true,
      comments: true,
      votes: true,
      generalFollows: true,
      badges: true,
      verifications: true,
      notifications: true,
      organization: true,
      organizedEvents: true,
      operaComments: true,
      answerFeedback: true,
    },
  });
  if (!data) return { ok: false as const, error: "Utente non trovato." };

  // Never export the password hash.
  const safe: Record<string, unknown> = { ...data };
  delete safe.passwordHash;
  return {
    ok: true as const,
    json: JSON.stringify(
      { exportedAt: new Date().toISOString(), account: safe },
      null,
      2,
    ),
  };
}

/** Permanently delete the citizen's account (GDPR erasure, §23). */
export async function deleteAccountAction() {
  const user = await requireUser();
  // Authored content keeps its display-name snapshot but loses the author link
  // (Report/Proposal/CommunityPost/PostComment use onDelete: SetNull).
  await prisma.user.delete({ where: { id: user.id } });
  await destroyCurrentSession();
  redirect("/");
}
