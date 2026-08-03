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
  /** Consultazione con documento (A2 §23, O4): null quando non c'è un documento. */
  doc: { title: string; summary: string; url: string | null } | null;
  options: PollOptionResult[];
};

export async function getPolls(userId: string): Promise<PollResult[]> {
  /*
    Nessun `include: { assessore: true }`, e non è un'ottimizzazione.

    I sondaggi sono dimostrativi; gli assessori, dal 2026-08-03, sono nove
    persone reali con la propria fonte (`lib/giunta.ts`). Mostrare «assessore
    di riferimento: Stefania Nesi» sotto una consultazione che nessuno ha
    aperto è un dato inventato su una persona reale — la stessa categoria delle
    preferenze elettorali tolte da /organigramma. Il seed non collega più i due,
    e qui la relazione smette anche di essere letta.
  */
  const polls = await prisma.poll.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: {
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

/*
  `getServiceReviews()` è stata rimossa il 2026-08-03 con il modello
  `ServiceReview`. Restituiva quattro medie inventate — «Anagrafe 4,6 su 1.280
  recensioni» — che non potevano sopravvivere all'arrivo delle valutazioni
  vere: sarebbero state due valutazioni degli stessi servizi nella stessa
  applicazione, una reale e una fabbricata. Ora le valutazioni vivono in
  `lib/valutazioni.ts` e partono da zero, che è lo stato onesto del giorno uno.
  Vedi `docs/piano-rating-servizi.md` §5.
*/

// Soddisfazione media servizi digitali (mock KPI from the concept).
// Null fuori da DEMO_MODE: la UI deve nascondere il KPI, non inventarlo.
export const SODDISFAZIONE_DIGITALE = DEMO_MODE ? 78 : null;
