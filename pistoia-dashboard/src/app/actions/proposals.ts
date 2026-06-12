"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireStaff } from "@/lib/auth/dal";
import { initialsOf } from "@/lib/colors";
import {
  PROPOSAL_STATUS,
  PROPOSAL_THRESHOLDS,
  proposalStatus,
  publicNameOf,
} from "@/lib/community";
import { awardBadge } from "@/lib/badges";
import { checkContribution } from "@/lib/moderation";
import { demoBaseline } from "@/lib/demo";
import { limitWrite } from "@/lib/limits";
import { notify } from "@/lib/notify";
import {
  serializeAffectedGroups,
  IMPACT_SCALE,
  COST_SCALE,
  TIME_SCALE,
  FEASIBILITY_SCALE,
} from "@/lib/civic-topics";

export type ProposalFormState =
  | { ok?: boolean; error?: string; id?: string }
  | undefined;

const createSchema = z.object({
  title: z.string().trim().min(6, "Il titolo è troppo breve.").max(140),
  description: z.string().trim().min(12, "Spiega la tua proposta.").max(1200),
  problem: z.string().trim().max(800).optional(),
  category: z.string().trim().max(40).optional(),
  neighborhoodId: z.string().optional(),
});

export async function createProposalAction(
  _prev: ProposalFormState,
  formData: FormData,
): Promise<ProposalFormState> {
  const user = await requireUser();
  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    problem: formData.get("problem") || undefined,
    category: formData.get("category") || undefined,
    neighborhoodId: formData.get("neighborhoodId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const { title, description, problem, category, neighborhoodId } = parsed.data;
  // Gruppi impattati (A2 §26): chiavi ripetute nel form, filtrate sul catalogo.
  const affectedGroups = serializeAffectedGroups(
    formData.getAll("affectedGroups").map(String),
  );

  const lw = await limitWrite(user.id, "proposal");
  if (!lw.ok) return { error: lw.error };

  // Guard moderazione: era assente qui (ban/sospensione + parole bloccate).
  const check = await checkContribution(
    user.id,
    `${title} ${problem ?? ""} ${description}`,
  );
  if (!check.ok) return { error: check.error };

  const proposal = await prisma.proposal.create({
    data: {
      authorId: user.id,
      authorName: publicNameOf(user.name, user.publicName),
      authorInitials: initialsOf(user.name),
      authorColor: user.avatarColor,
      title,
      description,
      problem: problem || null,
      affectedGroups,
      category: category || null,
      neighborhoodId: neighborhoodId || user.neighborhoodId || null,
      status: "pubblicata",
    },
  });

  await awardBadge(user.id, "first_contribution");
  revalidatePath("/proposte");
  revalidatePath("/la-mia-citta");
  return { ok: true, id: proposal.id };
}

/** Support a proposal (verified citizens only). Toggles on/off. */
export async function supportProposalAction(proposalId: string) {
  const user = await requireUser();
  if (!user.verifiedType) {
    return {
      ok: false as const,
      error: "Solo i profili verificati possono supportare le proposte.",
    };
  }

  const lw = await limitWrite(user.id, "support");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const existing = await prisma.proposalSupport.findUnique({
    where: { proposalId_userId: { proposalId, userId: user.id } },
  });

  if (existing) {
    await prisma.proposalSupport.delete({ where: { id: existing.id } });
  } else {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { id: true, baseSupports: true, status: true },
    });
    if (!proposal) return { ok: false as const };
    await prisma.proposalSupport.create({
      data: { proposalId, userId: user.id },
    });

    // Auto-escalate to "in valutazione" once the official threshold is reached.
    if (proposal.status === "pubblicata") {
      const total =
        demoBaseline(proposal.baseSupports) +
        (await prisma.proposalSupport.count({ where: { proposalId } }));
      if (total >= PROPOSAL_THRESHOLDS.official) {
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "in_valutazione" },
        });
      }
    }
  }

  revalidatePath("/proposte");
  revalidatePath(`/proposte/${proposalId}`);
  revalidatePath("/la-mia-citta");
  return { ok: true as const, supported: !existing };
}

const reviewSchema = z.object({
  proposalId: z.string().min(1),
  status: z.string().refine((s) => s in PROPOSAL_STATUS, "Stato non valido."),
  reply: z.string().trim().max(800).optional(),
  // Valutazione sintetica (A1 §15 + A2 §10): facoltativa, indicativa.
  estimatedImpact: z.string().refine((s) => s in IMPACT_SCALE, "Valore non valido.").optional(),
  estimatedCost: z.string().refine((s) => s in COST_SCALE, "Valore non valido.").optional(),
  estimatedTime: z.string().refine((s) => s in TIME_SCALE, "Valore non valido.").optional(),
  feasibility: z.string().refine((s) => s in FEASIBILITY_SCALE, "Valore non valido.").optional(),
});

export type ProposalAdminState = { ok?: boolean; error?: string } | undefined;

export async function reviewProposalAction(
  _prev: ProposalAdminState,
  formData: FormData,
): Promise<ProposalAdminState> {
  const staff = await requireStaff();
  const parsed = reviewSchema.safeParse({
    proposalId: formData.get("proposalId"),
    status: formData.get("status"),
    reply: formData.get("reply") || undefined,
    estimatedImpact: formData.get("estimatedImpact") || undefined,
    estimatedCost: formData.get("estimatedCost") || undefined,
    estimatedTime: formData.get("estimatedTime") || undefined,
    feasibility: formData.get("feasibility") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const { proposalId, status, reply, ...assessRaw } = parsed.data;
  // Solo i campi compilati: i select vuoti non cancellano una valutazione già data.
  const assess = Object.fromEntries(
    Object.entries(assessRaw).filter(([, v]) => v !== undefined),
  );

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true, authorId: true, title: true },
  });
  if (!proposal) return { error: "Proposta non trovata." };

  await prisma.$transaction(async (tx) => {
    await tx.proposal.update({
      where: { id: proposal.id },
      data: {
        status,
        ...(reply
          ? { officialReply: reply, officialReplyAt: new Date() }
          : {}),
        ...(Object.keys(assess).length > 0
          ? { ...assess, assessedAt: new Date() }
          : {}),
      },
    });
    await tx.moderationAction.create({
      data: {
        actorId: staff.id,
        action: "proposal_status",
        targetType: "proposal",
        targetId: proposal.id,
        reason: proposalStatus(status).label,
      },
    });
  });

  if (proposal.authorId) {
    await notify(
      proposal.authorId,
      {
        type: "proposal",
        title: "Aggiornamento sulla tua proposta",
        body: `«${proposal.title}» → ${proposalStatus(status).label}`,
        href: `/proposte/${proposal.id}`,
      },
      "proposals",
    );
  }

  revalidatePath(`/proposte/${proposal.id}`);
  revalidatePath("/proposte");
  revalidatePath("/admin");
  return { ok: true };
}
