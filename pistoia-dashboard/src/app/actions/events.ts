"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { TAGS } from "@/lib/cache";
import { requireUser, requireModerator } from "@/lib/auth/dal";
import { EVENT_CATEGORIES, isStaff, publicNameOf } from "@/lib/community";
import { checkContribution } from "@/lib/moderation";
import { limitWrite } from "@/lib/limits";
import { notify } from "@/lib/notify";

export type EventFormState = { ok?: boolean; error?: string } | undefined;

const schema = z.object({
  title: z.string().trim().min(4, "Titolo troppo breve.").max(120),
  description: z.string().trim().min(10, "Aggiungi qualche dettaglio.").max(1500),
  category: z.string().refine((c) => EVENT_CATEGORIES.includes(c), "Scegli una categoria."),
  startAt: z.string().min(1, "Indica data e ora di inizio."),
  endAt: z.string().optional(),
  location: z.string().trim().max(160).optional(),
  neighborhoodId: z.string().optional(),
});

/** Returns true if the user may publish/propose events. */
function canPublishEvents(user: { role: string; accountType: string; verifiedType: string | null }) {
  if (isStaff(user.role)) return "publish" as const;
  const isOrg = user.accountType === "ASSOCIATION" || user.accountType === "BUSINESS";
  if (isOrg && user.verifiedType) return "propose" as const;
  return false as const;
}

/** Create an event: the Comune publishes directly, verified associations propose for approval (§17). */
export async function createEventAction(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const user = await requireUser();
  const mode = canPublishEvents(user);
  if (!mode) {
    return { error: "Solo il Comune e le associazioni verificate possono pubblicare eventi." };
  }

  const parsed = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt") || undefined,
    location: formData.get("location") || undefined,
    neighborhoodId: formData.get("neighborhoodId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const lw = await limitWrite(user.id, "event");
  if (!lw.ok) return { error: lw.error };

  const check = await checkContribution(user.id, `${parsed.data.title} ${parsed.data.description}`);
  if (!check.ok) return { error: check.error };

  const startAt = new Date(parsed.data.startAt);
  if (Number.isNaN(startAt.getTime())) return { error: "Data di inizio non valida." };
  const endAt = parsed.data.endAt ? new Date(parsed.data.endAt) : null;
  if (endAt && Number.isNaN(endAt.getTime())) return { error: "Data di fine non valida." };
  if (endAt && endAt < startAt) return { error: "La fine non può precedere l'inizio." };

  const status = mode === "publish" ? "published" : "proposed";
  const organizerName =
    mode === "publish"
      ? "Comune di Pistoia"
      : publicNameOf(user.name, user.publicName);

  await prisma.event.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      startAt,
      endAt,
      location: parsed.data.location || null,
      neighborhoodId: parsed.data.neighborhoodId || user.neighborhoodId || null,
      organizerId: user.id,
      organizerName,
      status,
    },
  });

  revalidateTag(TAGS.eventi, "max");
  revalidatePath("/eventi");
  return { ok: true };
}

/** Comune/moderator approves or rejects a proposed event (§17). */
export async function reviewEventAction(eventId: string, approve: boolean) {
  const mod = await requireModerator();
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, organizerId: true, status: true },
  });
  if (!event || event.status !== "proposed") return { ok: false as const };

  await prisma.$transaction([
    prisma.event.update({
      where: { id: event.id },
      data: { status: approve ? "published" : "rejected" },
    }),
    prisma.moderationAction.create({
      data: {
        actorId: mod.id,
        action: approve ? "event_approve" : "event_reject",
        targetType: "event",
        targetId: event.id,
      },
    }),
  ]);

  if (event.organizerId) {
    await notify(event.organizerId, {
      type: "event",
      title: approve ? "Evento approvato" : "Evento non approvato",
      body: approve
        ? `«${event.title}» è ora pubblico nel calendario eventi.`
        : `«${event.title}» non è stato approvato dal Comune.`,
      href: "/eventi",
    });
  }

  revalidateTag(TAGS.eventi, "max");
  revalidatePath("/eventi");
  revalidatePath("/admin");
  return { ok: true as const };
}
