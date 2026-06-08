import "server-only";
import { prisma } from "@/lib/db";
import { toPercents } from "@/lib/percent";

export type PollOptionResult = {
  id: string;
  label: string;
  color: string;
  votes: number;
  percent: number;
};

export type PollResult = {
  id: string;
  question: string;
  description: string | null;
  category: string;
  active: boolean;
  totalVotes: number;
  userOptionId: string | null;
  assessore: {
    id: string;
    name: string;
    role: string;
    initials: string;
    color: string;
    votesElected: number;
  } | null;
  options: PollOptionResult[];
};

export async function getPolls(userId: string): Promise<PollResult[]> {
  const polls = await prisma.poll.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: {
      assessore: true,
      options: {
        orderBy: { order: "asc" },
        include: { _count: { select: { votes: true } } },
      },
      votes: { where: { userId }, select: { optionId: true } },
    },
  });

  return polls.map((p) => {
    const opts = p.options.map((o) => ({
      id: o.id,
      label: o.label,
      color: o.color,
      votes: o.baseVotes + o._count.votes,
    }));
    const total = opts.reduce((s, o) => s + o.votes, 0) || 1;
    const percents = toPercents(opts.map((o) => o.votes));
    return {
      id: p.id,
      question: p.question,
      description: p.description,
      category: p.category,
      active: p.active,
      totalVotes: total,
      userOptionId: p.votes[0]?.optionId ?? null,
      assessore: p.assessore
        ? {
            id: p.assessore.id,
            name: p.assessore.name,
            role: p.assessore.role,
            initials: p.assessore.initials,
            color: p.assessore.color,
            votesElected: p.assessore.votesElected,
          }
        : null,
      options: opts.map((o, i) => ({
        ...o,
        percent: percents[i],
      })),
    };
  });
}

export async function getServiceReviews() {
  return prisma.serviceReview.findMany({ orderBy: { order: "asc" } });
}

// Soddisfazione media servizi digitali (mock KPI from the concept).
export const SODDISFAZIONE_DIGITALE = 78;
