"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireStaff } from "@/lib/auth/dal";
import { VERIFICATION } from "@/lib/community";
import { awardVerificationBadge } from "@/lib/badges";
import { notify } from "@/lib/notify";

export type VerificationState = { ok?: boolean; error?: string } | undefined;

const requestSchema = z.object({
  type: z.enum(["IDENTITY", "RESIDENCY", "ASSOCIATION", "BUSINESS"]),
  organizationName: z.string().trim().max(120).optional(),
  note: z.string().trim().max(300).optional(),
});

export async function requestVerificationAction(
  _prev: VerificationState,
  formData: FormData,
): Promise<VerificationState> {
  const user = await requireUser();
  const parsed = requestSchema.safeParse({
    type: formData.get("type"),
    organizationName: formData.get("organizationName") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: "Dati non validi." };

  const { type, organizationName, note } = parsed.data;
  if ((type === "ASSOCIATION" || type === "BUSINESS") && !organizationName) {
    return { error: "Indica il nome dell'organizzazione." };
  }
  if (user.verifiedType === type) {
    return { error: "Sei già verificato per questo tipo." };
  }
  const pending = await prisma.profileVerification.findFirst({
    where: { userId: user.id, type, status: "PENDING" },
    select: { id: true },
  });
  if (pending) {
    return { error: "Hai già una richiesta in attesa per questo tipo." };
  }

  await prisma.profileVerification.create({
    data: {
      userId: user.id,
      type,
      organizationName: organizationName ?? null,
      note: note ?? null,
    },
  });
  revalidatePath("/profilo");
  revalidatePath("/admin");
  return { ok: true };
}

const reviewSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().trim().max(300).optional(),
});

export async function reviewVerificationAction(
  _prev: VerificationState,
  formData: FormData,
): Promise<VerificationState> {
  const staff = await requireStaff();
  const parsed = reviewSchema.safeParse({
    id: formData.get("id"),
    decision: formData.get("decision"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: "Dati non validi." };

  const ver = await prisma.profileVerification.findUnique({
    where: { id: parsed.data.id },
  });
  if (!ver || ver.status !== "PENDING") {
    return { error: "Richiesta non trovata o già gestita." };
  }

  const approved = parsed.data.decision === "APPROVED";
  const accountType =
    ver.type === "ASSOCIATION"
      ? "ASSOCIATION"
      : ver.type === "BUSINESS"
        ? "BUSINESS"
        : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.profileVerification.update({
      where: { id: ver.id },
      data: {
        status: parsed.data.decision,
        reviewedAt: new Date(),
        reviewedById: staff.id,
        note: parsed.data.note ?? ver.note,
      },
    });
    if (approved) {
      await tx.user.update({
        where: { id: ver.userId },
        data: { verifiedType: ver.type, ...(accountType ? { accountType } : {}) },
      });
      if (accountType && ver.organizationName) {
        await tx.organizationProfile.upsert({
          where: { userId: ver.userId },
          create: {
            userId: ver.userId,
            type: ver.type,
            name: ver.organizationName,
            verified: true,
          },
          update: { type: ver.type, name: ver.organizationName, verified: true },
        });
      }
    }
    await tx.moderationAction.create({
      data: {
        actorId: staff.id,
        action: approved ? "verify_approve" : "verify_reject",
        targetType: "verification",
        targetId: ver.id,
        reason: VERIFICATION[ver.type]?.label ?? ver.type,
      },
    });
  });

  if (approved) await awardVerificationBadge(ver.userId, ver.type);
  await notify(ver.userId, {
    type: "verification",
    title: approved ? "Profilo verificato" : "Verifica non approvata",
    body: approved
      ? `La verifica «${VERIFICATION[ver.type]?.label ?? ver.type}» è stata approvata.`
      : "La tua richiesta di verifica non è stata approvata. Puoi inviarne una nuova.",
    href: "/profilo",
  });

  revalidatePath("/admin");
  revalidatePath("/profilo");
  revalidatePath("/", "layout");
  return { ok: true };
}
