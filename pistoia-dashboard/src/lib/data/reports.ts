import "server-only";
import { prisma } from "@/lib/db";
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
    assignedDepartment: r.assignedDepartment,
    neighborhoodName: r.neighborhood?.name ?? null,
    authorName: r.authorName,
    authorInitials: r.authorInitials,
    authorColor: r.authorColor,
    confirmations: r.baseConfirmations + r._count.confirmations,
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
    },
  });
  if (!r) return null;
  return { ...mapReport(r, userId), updates: r.updates };
}

export type ReportDetail = NonNullable<Awaited<ReturnType<typeof getReport>>>;

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
