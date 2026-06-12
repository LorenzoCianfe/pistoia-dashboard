"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireStaff } from "@/lib/auth/dal";
import { initialsOf } from "@/lib/colors";
import {
  REPORT_CATEGORIES,
  REPORT_STATUS,
  REPORT_PHOTO_PHASES,
  reportStatus,
  publicNameOf,
  quickReportTitle,
  canModerate,
  isStaff,
} from "@/lib/community";
import { awardBadge } from "@/lib/badges";
import { checkContribution } from "@/lib/moderation";
import { limitWrite } from "@/lib/limits";
import { notify } from "@/lib/notify";

export type ReportFormState =
  | { ok?: boolean; error?: string; id?: string }
  | undefined;

// Max length of an uploaded photo as a data URL (§9). The composer downscales
// client-side, so a real photo lands well under this ceiling.
const MAX_PHOTO_CHARS = 1_500_000;

const createSchema = z.object({
  title: z.string().trim().min(6, "Il titolo è troppo breve.").max(120),
  description: z.string().trim().min(12, "Aggiungi qualche dettaglio.").max(1000),
  category: z
    .string()
    .refine((c) => REPORT_CATEGORIES.includes(c), "Scegli una categoria."),
  neighborhoodId: z.string().optional(),
  location: z.string().trim().max(160).optional(),
});

// Flusso rapido "Segnala in 30 secondi" (A2 §4): foto → posizione → categoria
// → invia. Titolo e descrizione sono generati; i dettagli arrivano dopo,
// facoltativi (regola di prodotto n. 5).
const quickSchema = z.object({
  category: z
    .string()
    .refine((c) => REPORT_CATEGORIES.includes(c), "Scegli una categoria."),
  neighborhoodId: z.string().optional(),
  location: z.string().trim().max(160).optional(),
});

/** Parse + validate the optional precise coordinates (§9). */
function parseCoords(formData: FormData): { latitude: number; longitude: number } | null {
  const latRaw = formData.get("latitude");
  const lngRaw = formData.get("longitude");
  if (typeof latRaw !== "string" || typeof lngRaw !== "string" || !latRaw || !lngRaw) {
    return null;
  }
  const latitude = Number(latRaw);
  const longitude = Number(lngRaw);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

export async function createReportAction(
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const user = await requireUser();

  // Modalità rapida (A2 §4): titolo/descrizione generati dalla categoria.
  const quick = formData.get("mode") === "rapida";
  let title: string;
  let description: string;
  let category: string;
  let neighborhoodId: string | undefined;
  let location: string | undefined;

  if (quick) {
    const parsed = quickSchema.safeParse({
      category: formData.get("category"),
      neighborhoodId: formData.get("neighborhoodId") || undefined,
      location: formData.get("location") || undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
    }
    ({ category, neighborhoodId, location } = parsed.data);
    title = quickReportTitle(category, location);
    description =
      "Segnalazione rapida inviata dal telefono. Dettagli aggiuntivi non ancora forniti.";
  } else {
    const parsed = createSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      neighborhoodId: formData.get("neighborhoodId") || undefined,
      location: formData.get("location") || undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
    }
    ({ title, description, category, neighborhoodId, location } = parsed.data);
  }

  const lw = await limitWrite(user.id, "report");
  if (!lw.ok) return { error: lw.error };

  const check = await checkContribution(user.id, `${title} ${description}`);
  if (!check.ok) return { error: check.error };

  // Optional uploaded photo (data URL) — §9.
  const photoRaw = formData.get("photoData");
  let photoData: string | null = null;
  if (typeof photoRaw === "string" && photoRaw.startsWith("data:image/")) {
    if (photoRaw.length > MAX_PHOTO_CHARS) {
      return { error: "La foto è troppo grande. Riprova con un'immagine più piccola." };
    }
    photoData = photoRaw;
  }

  const coords = parseCoords(formData);
  const anonymous =
    formData.get("anonymous") === "on" || formData.get("anonymous") === "true";
  // Urgenza (A1 §8): il cittadino la richiede, un moderatore la valida.
  const urgent =
    formData.get("urgent") === "on" || formData.get("urgent") === "true";

  const report = await prisma.report.create({
    data: {
      authorId: user.id, // kept internally even when anonymous (partial anonymity, §23)
      authorName: anonymous ? "Segnalazione anonima" : publicNameOf(user.name, user.publicName),
      authorInitials: anonymous ? "?" : initialsOf(user.name),
      authorColor: anonymous ? "viola" : user.avatarColor,
      title,
      description,
      category,
      neighborhoodId: neighborhoodId || user.neighborhoodId || null,
      location: location || null,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      photoData,
      anonymous,
      urgency: urgent ? "richiesta" : null,
      status: "ricevuta",
      updates: {
        create: {
          status: "ricevuta",
          note: urgent
            ? "Segnalazione ricevuta con richiesta di urgenza: un moderatore la verificherà a breve."
            : "Segnalazione ricevuta. In attesa di validazione.",
        },
      },
    },
  });

  // Record geolocation consent when the citizen shared precise coordinates (§23).
  if (coords && !user.geoConsent) {
    await prisma.user.update({ where: { id: user.id }, data: { geoConsent: true } });
  }

  await awardBadge(user.id, "first_contribution");
  revalidatePath("/segnalazioni");
  revalidatePath("/la-mia-citta");
  revalidatePath("/mappa");
  return { ok: true, id: report.id };
}

/** "Anche io" — toggle a confirmation on an existing report (dedupe signal). */
export async function confirmReportAction(reportId: string) {
  const user = await requireUser();

  const lw = await limitWrite(user.id, "confirm");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const existing = await prisma.reportConfirmation.findUnique({
    where: { reportId_userId: { reportId, userId: user.id } },
  });
  if (existing) {
    await prisma.reportConfirmation.delete({ where: { id: existing.id } });
  } else {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });
    if (!report) return { ok: false as const };
    await prisma.reportConfirmation.create({
      data: { reportId, userId: user.id },
    });
  }
  revalidatePath("/segnalazioni");
  revalidatePath(`/segnalazioni/${reportId}`);
  return { ok: true as const, confirmed: !existing };
}

const statusSchema = z.object({
  reportId: z.string().min(1),
  status: z.string().refine((s) => s in REPORT_STATUS, "Stato non valido."),
  department: z.string().trim().max(80).optional(),
  note: z.string().trim().max(400).optional(),
});

export type ReportAdminState = { ok?: boolean; error?: string } | undefined;

/** Comune-side triage: change status, assign a department, leave an official note. */
export async function updateReportStatusAction(
  _prev: ReportAdminState,
  formData: FormData,
): Promise<ReportAdminState> {
  const staff = await requireStaff();
  const parsed = statusSchema.safeParse({
    reportId: formData.get("reportId"),
    status: formData.get("status"),
    department: formData.get("department") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const { reportId, status, department, note } = parsed.data;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, authorId: true, title: true },
  });
  if (!report) return { error: "Segnalazione non trovata." };

  const resolved = status === "risolta";
  await prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id: report.id },
      data: {
        status,
        assignedDepartment: department || undefined,
        resolvedAt: resolved ? new Date() : undefined,
      },
    });
    await tx.reportStatusHistory.create({
      data: {
        reportId: report.id,
        status,
        note: note || null,
        official: true,
        authorName: "Comune di Pistoia",
      },
    });
    await tx.moderationAction.create({
      data: {
        actorId: staff.id,
        action: "report_status",
        targetType: "report",
        targetId: report.id,
        reason: reportStatus(status).label,
      },
    });
  });

  if (report.authorId) {
    await notify(
      report.authorId,
      {
        type: "report",
        title: "Aggiornamento sulla tua segnalazione",
        body: `«${report.title}» → ${reportStatus(status).label}`,
        href: `/segnalazioni/${report.id}`,
      },
      "followedItems",
    );
  }

  revalidatePath(`/segnalazioni/${report.id}`);
  revalidatePath("/segnalazioni");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Conferma del cittadino dopo la risoluzione (A1 §5)
// ---------------------------------------------------------------------------

/**
 * "È davvero risolta?" — solo l'autore, solo su risolta/chiusa, una volta sola.
 * "riaperta" riporta la segnalazione in lavorazione con nota pubblica.
 */
export async function confirmResolutionAction(
  reportId: string,
  outcome: "confermata" | "riaperta",
) {
  const user = await requireUser();
  if (outcome !== "confermata" && outcome !== "riaperta") {
    return { ok: false as const, error: "Esito non valido." };
  }

  const lw = await limitWrite(user.id, "confirm");
  if (!lw.ok) return { ok: false as const, error: lw.error };

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, authorId: true, status: true, resolutionFeedback: true },
  });
  if (!report) return { ok: false as const, error: "Segnalazione non trovata." };
  if (report.authorId !== user.id) {
    return { ok: false as const, error: "Solo chi ha segnalato può confermare." };
  }
  if (report.status !== "risolta" && report.status !== "chiusa") {
    return { ok: false as const, error: "La segnalazione non risulta risolta." };
  }
  if (report.resolutionFeedback) {
    return { ok: false as const, error: "Hai già inviato la tua conferma." };
  }

  const reopened = outcome === "riaperta";
  const citizenName = publicNameOf(user.name, user.publicName);
  await prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id: report.id },
      data: {
        resolutionFeedback: outcome,
        resolutionFeedbackAt: new Date(),
        ...(reopened
          ? { status: "in_lavorazione", resolvedAt: null }
          : {}),
      },
    });
    await tx.reportStatusHistory.create({
      data: {
        reportId: report.id,
        status: reopened ? "in_lavorazione" : report.status,
        note: reopened
          ? `Il cittadino segnala che il problema è ancora presente: pratica riaperta. (${citizenName})`
          : `Risoluzione confermata dal cittadino. (${citizenName})`,
        official: false,
        authorName: citizenName,
      },
    });
  });

  revalidatePath(`/segnalazioni/${report.id}`);
  revalidatePath("/segnalazioni");
  revalidatePath("/admin");
  return { ok: true as const, outcome };
}

// ---------------------------------------------------------------------------
// Validazione dell'urgenza (A1 §8) — moderatori e staff
// ---------------------------------------------------------------------------

export async function validateUrgencyAction(
  _prev: ReportAdminState,
  formData: FormData,
): Promise<ReportAdminState> {
  const user = await requireUser();
  if (!canModerate(user.role) && !isStaff(user.role)) {
    return { error: "Operazione riservata a moderatori e staff." };
  }

  const reportId = formData.get("reportId");
  const outcome = formData.get("outcome");
  if (
    typeof reportId !== "string" ||
    (outcome !== "confermata" && outcome !== "respinta")
  ) {
    return { error: "Dati non validi." };
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, status: true, urgency: true, authorId: true, title: true },
  });
  if (!report) return { error: "Segnalazione non trovata." };
  if (report.urgency !== "richiesta") {
    return { error: "Nessuna richiesta di urgenza da valutare." };
  }

  const confirmed = outcome === "confermata";
  await prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id: report.id },
      data: { urgency: outcome },
    });
    await tx.reportStatusHistory.create({
      data: {
        reportId: report.id,
        status: report.status,
        note: confirmed
          ? "Urgenza confermata: la segnalazione viene trattata con priorità."
          : "Richiesta di urgenza valutata: la segnalazione segue il flusso ordinario.",
        official: true,
        authorName: "Comune di Pistoia",
      },
    });
    await tx.moderationAction.create({
      data: {
        actorId: user.id,
        action: "report_urgency",
        targetType: "report",
        targetId: report.id,
        reason: confirmed ? "Urgenza confermata" : "Urgenza respinta",
      },
    });
  });

  if (report.authorId) {
    await notify(
      report.authorId,
      {
        type: "report",
        title: confirmed
          ? "La tua segnalazione è stata marcata urgente"
          : "Aggiornamento sulla richiesta di urgenza",
        body: `«${report.title}»`,
        href: `/segnalazioni/${report.id}`,
      },
      "followedItems",
    );
  }

  revalidatePath(`/segnalazioni/${report.id}`);
  revalidatePath("/segnalazioni");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Foto durante/dopo dal Comune (A1 §4)
// ---------------------------------------------------------------------------

export async function addReportPhotoAction(
  _prev: ReportAdminState,
  formData: FormData,
): Promise<ReportAdminState> {
  await requireStaff();

  const reportId = formData.get("reportId");
  const phase = formData.get("phase");
  const photoRaw = formData.get("photoData");
  const captionRaw = formData.get("caption");

  if (
    typeof reportId !== "string" ||
    typeof phase !== "string" ||
    !(REPORT_PHOTO_PHASES as readonly string[]).includes(phase)
  ) {
    return { error: "Dati non validi." };
  }
  if (
    typeof photoRaw !== "string" ||
    !photoRaw.startsWith("data:image/") ||
    photoRaw.length > MAX_PHOTO_CHARS
  ) {
    return { error: "Foto mancante o troppo grande." };
  }
  const caption =
    typeof captionRaw === "string" ? captionRaw.trim().slice(0, 160) : null;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true },
  });
  if (!report) return { error: "Segnalazione non trovata." };

  await prisma.reportPhoto.create({
    data: {
      reportId: report.id,
      phase,
      photoData: photoRaw,
      caption: caption || null,
      official: true,
      authorName: "Comune di Pistoia",
    },
  });

  revalidatePath(`/segnalazioni/${report.id}`);
  return { ok: true };
}
