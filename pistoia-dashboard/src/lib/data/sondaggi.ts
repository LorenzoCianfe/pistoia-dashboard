import "server-only";
import { prisma } from "@/lib/db";
import { demoBaseline, DEMO_MODE } from "@/lib/demo";
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
  /** Consultazione con documento (A2 §23, O4): null quando non c'è un documento. */
  doc: { title: string; summary: string; url: string | null } | null;
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
      votes: demoBaseline(o.baseVotes) + o._count.votes,
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
      doc: p.docTitle
        ? { title: p.docTitle, summary: p.docSummary ?? "", url: p.docUrl }
        : null,
      options: opts.map((o, i) => ({
        ...o,
        percent: percents[i],
      })),
    };
  });
}

export async function getServiceReviews() {
  // Le recensioni dei servizi sono interamente mock: fuori da DEMO_MODE
  // spariscono (la UI mostra lo zero-state onesto).
  if (!DEMO_MODE) return [];
  return prisma.serviceReview.findMany({ orderBy: { order: "asc" } });
}

// Soddisfazione media servizi digitali (mock KPI from the concept).
// Null fuori da DEMO_MODE: la UI deve nascondere il KPI, non inventarlo.
export const SODDISFAZIONE_DIGITALE = DEMO_MODE ? 78 : null;
