import "server-only";
import { prisma } from "@/lib/db";
import { weeklyBuckets } from "@/lib/citystats";

// "Stato della città" (O3, 🆕): gli indicatori sintetici dell'hero in home.
// Le serie settimanali alimentano le sparkline: 8 settimane, dalla più
// vecchia alla più recente.

const WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getCityState() {
  const now = new Date();
  const since = new Date(now.getTime() - WEEKS * WEEK_MS);

  const [resolvedDates, receivedDates, openReports, opereInCorso, avgProgress, activeProposals, activeNotices] =
    await Promise.all([
      prisma.report.findMany({
        where: { resolvedAt: { gte: since } },
        select: { resolvedAt: true },
      }),
      prisma.report.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.report.count({
        where: { status: { notIn: ["risolta", "chiusa", "non_di_competenza", "duplicata"] } },
      }),
      prisma.opera.count({ where: { status: "in_corso" } }),
      prisma.opera.aggregate({
        where: { status: "in_corso" },
        _avg: { progress: true },
      }),
      prisma.proposal.count({ where: { status: { in: ["pubblicata", "in_valutazione"] } } }),
      prisma.notice.count({ where: { active: true } }),
    ]);

  const resolvedSeries = weeklyBuckets(
    resolvedDates.flatMap((r) => (r.resolvedAt ? [r.resolvedAt] : [])),
    now,
    WEEKS,
  );
  const receivedSeries = weeklyBuckets(
    receivedDates.map((r) => r.createdAt),
    now,
    WEEKS,
  );

  return {
    reports: {
      open: openReports,
      resolvedLast8w: resolvedSeries.reduce((a, b) => a + b, 0),
      resolvedSeries,
      receivedSeries,
    },
    opere: {
      inCorso: opereInCorso,
      avgProgress: Math.round(avgProgress._avg.progress ?? 0),
    },
    proposals: { active: activeProposals },
    notices: { active: activeNotices },
  };
}

export type CityState = Awaited<ReturnType<typeof getCityState>>;
