"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/dal";
import { clamp } from "@/lib/utils";

export type AdminState = { ok?: boolean; error?: string } | undefined;

const answerSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(4, "La risposta è troppo breve.").max(600),
});

export async function answerPostAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = answerSchema.safeParse({
    postId: formData.get("postId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const post = await prisma.communityPost.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true, authorId: true, content: true },
  });
  if (!post) return { error: "Domanda non trovata." };

  await prisma.officialAnswer.upsert({
    where: { postId: post.id },
    create: { postId: post.id, body: parsed.data.body, verified: true },
    update: { body: parsed.data.body, verified: true },
  });

  if (post.authorId) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "answer",
        title: "Il Comune ha risposto",
        body: parsed.data.body.slice(0, 140),
        href: "/comunita",
      },
    });
  }

  revalidatePath("/comunita");
  revalidatePath("/admin");
  return { ok: true };
}

const operaSchema = z.object({
  operaId: z.string().min(1),
  progress: z.coerce.number().min(0).max(100),
  note: z.string().trim().min(3, "Aggiungi una nota.").max(300),
});

export async function updateOperaProgressAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = operaSchema.safeParse({
    operaId: formData.get("operaId"),
    progress: formData.get("progress"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const progress = clamp(parsed.data.progress);
  const opera = await prisma.opera.findUnique({
    where: { id: parsed.data.operaId },
    select: { status: true },
  });
  if (!opera) return { error: "Cantiere non trovato." };

  // Only auto-set status when it makes sense: completion at 100%, otherwise
  // preserve planned/suspended states instead of silently flipping them to "in corso".
  const nextStatus =
    progress >= 100
      ? "completata"
      : opera.status === "pianificata" || opera.status === "sospesa"
        ? opera.status
        : "in_corso";

  await prisma.opera.update({
    where: { id: parsed.data.operaId },
    data: {
      progress,
      status: nextStatus,
      updates: { create: { note: parsed.data.note, progress } },
    },
  });

  revalidatePath("/opere");
  revalidatePath("/admin");
  return { ok: true };
}

const pollSchema = z.object({
  question: z.string().trim().min(8, "La domanda è troppo breve.").max(160),
  category: z.string().trim().min(2).max(40),
  options: z
    .array(z.string().trim().min(1))
    .min(2, "Servono almeno due opzioni."),
});

const OPTION_COLORS = ["teal", "viola", "amber", "green", "red"];

export async function createPollAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();

  const options = formData
    .getAll("option")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const parsed = pollSchema.safeParse({
    question: formData.get("question"),
    category: formData.get("category") || "Sondaggio",
    options,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await prisma.poll.create({
    data: {
      question: parsed.data.question,
      category: parsed.data.category,
      year: new Date().getFullYear(),
      active: true,
      options: {
        create: parsed.data.options.map((label, i) => ({
          label,
          color: OPTION_COLORS[i % OPTION_COLORS.length],
          order: i + 1,
        })),
      },
    },
  });

  revalidatePath("/sondaggi");
  revalidatePath("/admin");
  return { ok: true };
}

const broadcastSchema = z.object({
  title: z.string().trim().min(3).max(80),
  body: z.string().trim().min(3).max(200),
  href: z.string().trim().max(120).optional(),
});

export async function broadcastNotificationAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = broadcastSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    href: formData.get("href") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: "system",
      title: parsed.data.title,
      body: parsed.data.body,
      href: parsed.data.href ?? null,
    })),
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  return { ok: true };
}
