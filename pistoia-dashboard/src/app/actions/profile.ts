"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/auth/validation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroyAllSessions,
  destroyCurrentSession,
} from "@/lib/auth/session";
import { ACCENTS } from "@/lib/colors";
import { limitWrite } from "@/lib/limits";

export type ProfileState =
  | {
      ok?: boolean;
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    }
  | undefined;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "profile");
  if (!lw.ok) return { error: lw.error };

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    quartiere: formData.get("quartiere"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const color = String(formData.get("avatarColor") ?? user.avatarColor);
  const avatarColor = (ACCENTS as string[]).includes(color)
    ? color
    : user.avatarColor;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio ? parsed.data.bio : null,
      quartiere: parsed.data.quartiere ? parsed.data.quartiere : null,
      avatarColor,
    },
  });

  revalidatePath("/profilo");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: "Utente non trovato." };

  const valid = await verifyPassword(
    dbUser.passwordHash,
    parsed.data.currentPassword,
  );
  if (!valid) {
    return {
      fieldErrors: { currentPassword: ["La password attuale non è corretta."] },
    };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Invalidate every existing session (logs out other devices), then re-issue
  // a fresh session for the current device so the user stays logged in here.
  await destroyAllSessions(user.id);
  await createSession(user.id);
  return { ok: true };
}

export async function logoutEverywhereAction() {
  const user = await requireUser();
  await destroyAllSessions(user.id);
  await destroyCurrentSession();
  redirect("/login");
}
