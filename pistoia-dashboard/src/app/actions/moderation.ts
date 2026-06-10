"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, requireModerator } from "@/lib/auth/dal";
import { invalidateBlockedWords } from "@/lib/moderation";

/** Soft-hide a community post (moderators / admin). Logged to ModerationAction. */
export async function hidePostAction(postId: string, reason?: string) {
  const mod = await requireModerator();
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) return { ok: false as const };

  await prisma.$transaction([
    prisma.communityPost.update({
      where: { id: postId },
      data: { hidden: true },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: mod.id,
        action: "hide_post",
        targetType: "post",
        targetId: postId,
        reason: reason || null,
      },
    }),
  ]);

  revalidatePath("/comunita");
  revalidatePath("/admin");
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// §14 — report a comment, hide it, sanction users, blocked words, merge reports
// ---------------------------------------------------------------------------

/** A citizen flags a community comment for review (§14). */
export async function reportCommentAction(commentId: string, reason?: string) {
  const user = await requireUser();
  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });
  if (!comment) return { ok: false as const };

  await prisma.commentReport.upsert({
    where: { commentId_reporterId: { commentId, reporterId: user.id } },
    create: { commentId, reporterId: user.id, reason: reason?.slice(0, 200) || null },
    update: { reason: reason?.slice(0, 200) || null, status: "open" },
  });
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Moderator soft-hides a flagged comment and resolves its reports (§14). */
export async function hideCommentAction(commentId: string) {
  const mod = await requireModerator();
  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });
  if (!comment) return { ok: false as const };

  await prisma.$transaction([
    prisma.postComment.update({ where: { id: commentId }, data: { hidden: true } }),
    prisma.commentReport.updateMany({ where: { commentId }, data: { status: "reviewed" } }),
    prisma.moderationAction.create({
      data: { actorId: mod.id, action: "hide_comment", targetType: "comment", targetId: commentId },
    }),
  ]);
  revalidatePath("/comunita");
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Moderator dismisses the reports on a comment without hiding it (§14). */
export async function dismissCommentReportsAction(commentId: string) {
  await requireModerator();
  await prisma.commentReport.updateMany({ where: { commentId }, data: { status: "dismissed" } });
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Temporarily suspend a citizen for N days (§14). */
export async function suspendUserAction(userId: string, days: number) {
  const mod = await requireModerator();
  const safeDays = Math.min(365, Math.max(1, Math.round(days)));
  const until = new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { suspendedUntil: until } }),
    prisma.moderationAction.create({
      data: {
        actorId: mod.id,
        action: "suspend_user",
        targetType: "user",
        targetId: userId,
        reason: `${safeDays} giorni`,
      },
    }),
  ]);
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Permanently ban a citizen and end all their sessions (§14). */
export async function banUserAction(userId: string) {
  const mod = await requireModerator();
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { banned: true } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.moderationAction.create({
      data: { actorId: mod.id, action: "ban_user", targetType: "user", targetId: userId },
    }),
  ]);
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Lift any ban/suspension on a citizen (§14). */
export async function liftUserSanctionAction(userId: string) {
  const mod = await requireModerator();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { banned: false, suspendedUntil: null },
    }),
    prisma.moderationAction.create({
      data: { actorId: mod.id, action: "lift_sanction", targetType: "user", targetId: userId },
    }),
  ]);
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Add a blocked word to the community content filter (§14). */
export async function addBlockedWordAction(word: string) {
  const mod = await requireModerator();
  const w = word.trim().toLowerCase();
  if (w.length < 2) return { ok: false as const, error: "Parola troppo breve." };
  await prisma.blockedWord.upsert({
    where: { word: w },
    create: { word: w, createdById: mod.id },
    update: {},
  });
  invalidateBlockedWords();
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Remove a blocked word (§14). */
export async function removeBlockedWordAction(id: string) {
  await requireModerator();
  await prisma.blockedWord.delete({ where: { id } }).catch(() => {});
  invalidateBlockedWords();
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Merge a duplicate report into a canonical one, moving its confirmations (§14). */
export async function mergeReportsAction(sourceId: string, targetId: string) {
  const mod = await requireModerator();
  if (!sourceId || !targetId || sourceId === targetId) {
    return { ok: false as const, error: "Seleziona due segnalazioni diverse." };
  }
  const [source, target] = await Promise.all([
    prisma.report.findUnique({ where: { id: sourceId }, select: { id: true } }),
    prisma.report.findUnique({ where: { id: targetId }, select: { id: true } }),
  ]);
  if (!source || !target) return { ok: false as const, error: "Segnalazione non trovata." };

  const confs = await prisma.reportConfirmation.findMany({
    where: { reportId: sourceId },
    select: { userId: true },
  });

  await prisma.$transaction(async (tx) => {
    for (const c of confs) {
      await tx.reportConfirmation.upsert({
        where: { reportId_userId: { reportId: targetId, userId: c.userId } },
        create: { reportId: targetId, userId: c.userId },
        update: {},
      });
    }
    await tx.reportConfirmation.deleteMany({ where: { reportId: sourceId } });
    await tx.report.update({
      where: { id: sourceId },
      data: { status: "duplicata", mergedIntoId: targetId },
    });
    await tx.reportStatusHistory.create({
      data: {
        reportId: sourceId,
        status: "duplicata",
        note: "Segnalazione unita a una già esistente dello stesso problema.",
        official: true,
        authorName: "Comune di Pistoia",
      },
    });
    await tx.moderationAction.create({
      data: {
        actorId: mod.id,
        action: "merge_reports",
        targetType: "report",
        targetId: sourceId,
        reason: `unita in ${targetId}`,
      },
    });
  });

  revalidatePath("/segnalazioni");
  revalidatePath(`/segnalazioni/${sourceId}`);
  revalidatePath(`/segnalazioni/${targetId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}
