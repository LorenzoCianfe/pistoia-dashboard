"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireModerator } from "@/lib/auth/dal";

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
