"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, requireModerator } from "@/lib/auth/dal";
import { initialsOf } from "@/lib/colors";
import { publicNameOf } from "@/lib/community";
import { checkContribution } from "@/lib/moderation";
import { limitWrite } from "@/lib/limits";

/** A citizen comments on a public work (§18). */
export async function addOperaCommentAction(operaId: string, body: string) {
  const user = await requireUser();
  const text = body.trim().slice(0, 600);
  if (text.length < 1) return { ok: false as const, error: "Scrivi un commento." };

  const lw = await limitWrite(user.id, "comment");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const check = await checkContribution(user.id, text);
  if (!check.ok) return { ok: false as const, error: check.error };

  const opera = await prisma.opera.findUnique({
    where: { id: operaId },
    select: { id: true },
  });
  if (!opera) return { ok: false as const, error: "Cantiere non trovato." };

  await prisma.operaComment.create({
    data: {
      operaId,
      authorId: user.id,
      authorName: publicNameOf(user.name, user.publicName),
      authorInitials: initialsOf(user.name),
      authorColor: user.avatarColor,
      body: text,
    },
  });

  revalidatePath(`/opere/${operaId}`);
  return { ok: true as const };
}

/** Moderator soft-hides an opera comment (§14). */
export async function hideOperaCommentAction(commentId: string) {
  const mod = await requireModerator();
  const comment = await prisma.operaComment.findUnique({
    where: { id: commentId },
    select: { operaId: true },
  });
  if (!comment) return { ok: false as const };

  await prisma.$transaction([
    prisma.operaComment.update({ where: { id: commentId }, data: { hidden: true } }),
    prisma.moderationAction.create({
      data: {
        actorId: mod.id,
        action: "hide_opera_comment",
        targetType: "opera_comment",
        targetId: commentId,
      },
    }),
  ]);

  revalidatePath(`/opere/${comment.operaId}`);
  return { ok: true as const };
}
