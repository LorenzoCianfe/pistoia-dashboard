import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline } from "@/lib/demo";

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
    confirmations: demoBaseline(r.baseConfirmations) + r._count.confirmations,
    createdAt: r.createdAt,
  }));

  const proposalsToReview = proposalsRaw
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      hasReply: !!p.officialReply,
      supports: demoBaseline(p.baseSupports) + p._count.supports,
      // Valutazione sintetica corrente (A1 §15): precompila il form di review.
      estimatedImpact: p.estimatedImpact,
      estimatedCost: p.estimatedCost,
      estimatedTime: p.estimatedTime,
      feasibility: p.feasibility,
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

/** Community moderation surface (§14): flagged comments, blocked words, sanctioned users. */
export async function getModerationData() {
  const [flaggedRaw, blockedWords, sanctioned] = await Promise.all([
    prisma.commentReport.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      include: { comment: { select: { id: true, postId: true, authorId: true, authorName: true, body: true, hidden: true } } },
    }),
    prisma.blockedWord.findMany({ orderBy: { word: "asc" } }),
    prisma.user.findMany({
      where: { OR: [{ banned: true }, { suspendedUntil: { gt: new Date() } }] },
      select: { id: true, name: true, banned: true, suspendedUntil: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const byComment = new Map<
    string,
    {
      commentId: string;
      postId: string;
      authorId: string | null;
      authorName: string;
      body: string;
      hidden: boolean;
      count: number;
      reasons: string[];
    }
  >();
  for (const f of flaggedRaw) {
    if (!f.comment) continue;
    const e = byComment.get(f.commentId) ?? {
      commentId: f.comment.id,
      postId: f.comment.postId,
      authorId: f.comment.authorId,
      authorName: f.comment.authorName,
      body: f.comment.body,
      hidden: f.comment.hidden,
      count: 0,
      reasons: [],
    };
    e.count += 1;
    if (f.reason) e.reasons.push(f.reason);
    byComment.set(f.commentId, e);
  }

  return {
    flaggedComments: [...byComment.values()],
    blockedWords,
    sanctioned,
  };
}

export type ModerationData = Awaited<ReturnType<typeof getModerationData>>;
