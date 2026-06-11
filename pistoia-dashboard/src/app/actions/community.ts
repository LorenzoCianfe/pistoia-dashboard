"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { initialsOf } from "@/lib/colors";
import { POST_KIND, publicNameOf } from "@/lib/community";
import { awardBadge } from "@/lib/badges";
import { checkContribution } from "@/lib/moderation";
import { limitWrite } from "@/lib/limits";

export async function toggleLikeAction(postId: string) {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "like");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    // Ensure the post exists before creating a like.
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) return { ok: false as const };
    await prisma.postLike.create({ data: { postId, userId: user.id } });
  }

  revalidatePath("/comunita");
  return { ok: true as const, liked: !existing };
}

const postSchema = z.object({
  content: z
    .string()
    .trim()
    .min(4, "Scrivi almeno qualche parola.")
    .max(500, "Il messaggio è troppo lungo."),
  kind: z.string().refine((k) => k in POST_KIND, "Tipo non valido.").optional(),
  category: z.string().trim().max(30).optional(),
  neighborhoodId: z.string().optional(),
});

export type FeedActionState = { ok?: boolean; error?: string } | undefined;

export async function createPostAction(
  _prev: FeedActionState,
  formData: FormData,
): Promise<FeedActionState> {
  const user = await requireUser();

  const parsed = postSchema.safeParse({
    content: formData.get("content"),
    kind: formData.get("kind") || undefined,
    category: formData.get("category") || undefined,
    neighborhoodId: formData.get("neighborhoodId") || undefined,
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.flatten().fieldErrors.content?.[0] ??
        "Messaggio non valido.",
    };
  }

  const lw = await limitWrite(user.id, "post");
  if (!lw.ok) return { error: lw.error };

  const check = await checkContribution(user.id, parsed.data.content);
  if (!check.ok) return { error: check.error };

  await prisma.communityPost.create({
    data: {
      authorId: user.id,
      authorName: publicNameOf(user.name, user.publicName),
      authorInitials: initialsOf(user.name),
      authorColor: user.avatarColor,
      kind: parsed.data.kind ?? "domanda",
      content: parsed.data.content,
      category: parsed.data.category ?? null,
      neighborhoodId: parsed.data.neighborhoodId || user.neighborhoodId || null,
    },
  });

  await awardBadge(user.id, "first_contribution");
  revalidatePath("/comunita");
  return { ok: true };
}

export async function addCommentAction(postId: string, body: string) {
  const user = await requireUser();
  const text = body.trim().slice(0, 400);
  if (text.length < 1) return { ok: false as const };

  const lw = await limitWrite(user.id, "comment");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const check = await checkContribution(user.id, text);
  if (!check.ok) return { ok: false as const, error: check.error };

  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) return { ok: false as const };

  await prisma.postComment.create({
    data: { postId, authorId: user.id, authorName: user.name, body: text },
  });

  revalidatePath("/comunita");
  return { ok: true as const };
}
