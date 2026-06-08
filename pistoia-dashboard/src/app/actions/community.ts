"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { initialsOf } from "@/lib/colors";

export async function toggleLikeAction(postId: string) {
  const user = await requireUser();

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
  category: z.string().trim().max(30).optional(),
});

export type FeedActionState = { ok?: boolean; error?: string } | undefined;

export async function createPostAction(
  _prev: FeedActionState,
  formData: FormData,
): Promise<FeedActionState> {
  const user = await requireUser();

  const parsed = postSchema.safeParse({
    content: formData.get("content"),
    category: formData.get("category") || undefined,
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.flatten().fieldErrors.content?.[0] ??
        "Messaggio non valido.",
    };
  }

  await prisma.communityPost.create({
    data: {
      authorId: user.id,
      authorName: user.name,
      authorInitials: initialsOf(user.name),
      authorColor: user.avatarColor,
      content: parsed.data.content,
      category: parsed.data.category ?? null,
    },
  });

  revalidatePath("/comunita");
  return { ok: true };
}

export async function addCommentAction(postId: string, body: string) {
  const user = await requireUser();
  const text = body.trim().slice(0, 400);
  if (text.length < 1) return { ok: false as const };

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
