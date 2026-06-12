import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline } from "@/lib/demo";
import type { Prisma } from "@/generated/prisma/client";

export type ReportFilter = {
  neighborhoodId?: string;
  category?: string;
  status?: string;
  mine?: boolean;
};

function buildWhere(userId: string, f?: ReportFilter): Prisma.ReportWhereInput {
  const where: Prisma.ReportWhereInput = {};
  if (f?.neighborhoodId) where.neighborhoodId = f.neighborhoodId;
  if (f?.category) where.category = f.category;
  if (f?.status) where.status = f.status;
  if (f?.mine) where.authorId = userId;
  return where;
}

type RawReport = Prisma.ReportGetPayload<{
  include: {
    neighborhood: { select: { name: true; slug: true } };
    _count: { select: { confirmations: true } };
    confirmations: { select: { id: true } };
  };
}>;

function mapReport(r: RawReport, userId: string) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    status: r.status,
    location: r.location,
    latitude: r.latitude,
    longitude: r.longitude,
    imageSeed: r.imageSeed,
    photoData: r.photoData,
    anonymous: r.anonymous,
    assignedDepartment: r.assignedDepartment,
    urgency: r.urgency,
    resolutionFeedback: r.resolutionFeedback,
    neighborhoodName: r.neighborhood?.name ?? null,
    authorName: r.authorName,
    authorInitials: r.authorInitials,
    authorColor: r.authorColor,
    confirmations: demoBaseline(r.baseConfirmations) + r._count.confirmations,
    confirmedByMe: r.confirmations.length > 0,
    isMine: r.authorId === userId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    resolvedAt: r.resolvedAt,
  };
}

export async function getReports(userId: string, filter?: ReportFilter) {
  const reports = await prisma.report.findMany({
    where: buildWhere(userId, filter),
    orderBy: [{ createdAt: "desc" }],
    include: {
      neighborhood: { select: { name: true, slug: true } },
      _count: { select: { confirmations: true } },
      confirmations: { where: { userId }, select: { id: true } },
    },
  });
  return reports.map((r) => mapReport(r, userId));
}

export type ReportListItem = Awaited<ReturnType<typeof getReports>>[number];

export async function getReport(id: string, userId: string) {
  const r = await prisma.report.findUnique({
    where: { id },
    include: {
      neighborhood: { select: { name: true, slug: true } },
      _count: { select: { confirmations: true } },
      confirmations: { where: { userId }, select: { id: true } },
      updates: { orderBy: { createdAt: "asc" } },
      photos: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!r) return null;
  return {
    ...mapReport(r, userId),
    updates: r.updates,
    photos: r.photos,
    resolutionFeedbackAt: r.resolutionFeedbackAt,
  };
}

export type ReportDetail = NonNullable<Awaited<ReturnType<typeof getReport>>>;

// ---------------------------------------------------------------------------
// Tempi medi indicativi per categoria (A1 §7): dati storici, non promesse.
// ---------------------------------------------------------------------------

// Baseline dimostrativa (giorni) per le categorie senza abbastanza casi
// risolti: il mock resta dichiarato via DEMO_MODE (regola di prodotto n. 4).
const AVG_DAYS_BASELINE: Record<string, number> = {
  buche: 7,
  illuminazione: 6,
  rifiuti: 3,
  verde: 9,
  sicurezza: 5,
  rumore: 12,
  trasporto: 14,
  barriere: 18,
  scuole: 10,
  parchi: 11,
  animali: 4,
  decoro: 8,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Tempo medio di risoluzione (in giorni) per categoria: media dei casi
 * realmente risolti, integrata dalla baseline demo dove i casi sono pochi.
 */
export async function getCategoryAvgDays(category: string): Promise<{
  days: number;
  samples: number;
} | null> {
  const resolved = await prisma.report.findMany({
    where: { category, resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true },
    take: 100,
  });
  const real = resolved
    .map((r) => (r.resolvedAt!.getTime() - r.createdAt.getTime()) / DAY_MS)
    .filter((d) => d >= 0);
  if (real.length >= 3) {
    const avg = real.reduce((s, d) => s + d, 0) / real.length;
    return { days: Math.max(1, Math.round(avg)), samples: real.length };
  }
  const baseline = AVG_DAYS_BASELINE[category];
  if (baseline == null) return null;
  // Pochi casi reali: la baseline pesa come 3 campioni dimostrativi.
  const avg =
    (real.reduce((s, d) => s + d, 0) + baseline * 3) / (real.length + 3);
  return { days: Math.max(1, Math.round(avg)), samples: real.length };
}

// ---------------------------------------------------------------------------
// Anti-duplicati (A1 §2): segnalazioni aperte simili per categoria e zona.
// ---------------------------------------------------------------------------

const OPEN_STATUSES = ["ricevuta", "validata", "presa_in_carico", "in_lavorazione"];

export async function findSimilarReports(
  userId: string,
  category: string,
  neighborhoodId?: string | null,
) {
  const since = new Date(Date.now() - 90 * DAY_MS);
  const reports = await prisma.report.findMany({
    where: {
      category,
      status: { in: OPEN_STATUSES },
      createdAt: { gte: since },
      ...(neighborhoodId ? { neighborhoodId } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    take: 4,
    include: {
      neighborhood: { select: { name: true, slug: true } },
      _count: { select: { confirmations: true } },
      confirmations: { where: { userId }, select: { id: true } },
    },
  });
  return reports.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    location: r.location,
    neighborhoodName: r.neighborhood?.name ?? null,
    confirmations: demoBaseline(r.baseConfirmations) + r._count.confirmations,
    confirmedByMe: r.confirmations.length > 0,
    createdAt: r.createdAt,
  }));
}

export type SimilarReport = Awaited<ReturnType<typeof findSimilarReports>>[number];

/** Aggregate counts by status for the admin triage view + KPIs. */
export async function getReportStats() {
  const grouped = await prisma.report.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const g of grouped) {
    byStatus[g.status] = g._count._all;
    total += g._count._all;
  }
  const open = total - (byStatus.risolta ?? 0) - (byStatus.chiusa ?? 0);
  return { byStatus, total, open, resolved: byStatus.risolta ?? 0 };
}
