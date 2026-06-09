import "server-only";
import { prisma } from "@/lib/db";

const REPORT_OPEN = { notIn: ["risolta", "chiusa", "non_di_competenza", "duplicata"] };

export async function getAdminData() {
  const [
    unanswered,
    answeredCount,
    opere,
    pollCount,
    userCount,
    pendingVerifications,
    openReportsRaw,
    proposalsRaw,
    recentModeration,
    resolvedReports,
  ] = await Promise.all([
    prisma.communityPost.findMany({
      where: { answer: null, hidden: false },
      orderBy: { createdAt: "desc" },
      include: { neighborhood: { select: { name: true } } },
    }),
    prisma.officialAnswer.count(),
    prisma.opera.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, progress: true, status: true },
    }),
    prisma.poll.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.profileVerification.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "asc" },
      include: {
        user: { select: { name: true, email: true, accountType: true, avatarColor: true } },
      },
    }),
    prisma.report.findMany({
      where: { status: REPORT_OPEN },
      orderBy: [{ createdAt: "desc" }],
      include: {
        neighborhood: { select: { name: true } },
        _count: { select: { confirmations: true } },
      },
    }),
    prisma.proposal.findMany({
      where: { status: { in: ["pubblicata", "in_valutazione", "risposta"] } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { supports: true } } },
    }),
    prisma.moderationAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true } } },
    }),
    prisma.report.count({ where: { status: "risolta" } }),
  ]);

  const openReports = openReportsRaw.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    status: r.status,
    neighborhoodName: r.neighborhood?.name ?? null,
    assignedDepartment: r.assignedDepartment,
    confirmations: r.baseConfirmations + r._count.confirmations,
    createdAt: r.createdAt,
  }));

  const proposalsToReview = proposalsRaw
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      hasReply: !!p.officialReply,
      supports: p.baseSupports + p._count.supports,
      createdAt: p.createdAt,
    }))
    .sort((a, b) => b.supports - a.supports);

  return {
    unanswered,
    answeredCount,
    opere,
    pollCount,
    userCount,
    pendingVerifications,
    openReports,
    openReportsCount: openReports.length,
    resolvedReports,
    proposalsToReview,
    recentModeration,
  };
}

export type AdminData = Awaited<ReturnType<typeof getAdminData>>;
