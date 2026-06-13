import type { Metadata } from "next";
import { ListOrdered, CalendarClock } from "lucide-react";
import { requireUser, isVerified } from "@/lib/auth/dal";
import { getPriorityRounds } from "@/lib/data/territorio";
import { PriorityVotePanel } from "@/components/territorio/priority-vote";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { priorityStatus } from "@/lib/territorio";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Vota la priorità",
  description:
    "Interventi già validati dagli uffici: i cittadini verificati scelgono quale fare prima. Il voto orienta il calendario, non sostituisce le valutazioni tecniche.",
};

/*
  "Vota la priorità" (A2 §9, O4): partecipazione con un perimetro onesto — gli
  interventi sono già validati, il voto decide solo l'ordine. Ogni tornata
  chiusa dichiara cosa ha fatto il Comune con l'esito.
*/

export default async function PrioritaPage() {
  const user = await requireUser();
  const rounds = await getPriorityRounds(user.id);

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Partecipazione"
        title="Vota la priorità"
        description="Interventi già validati dagli uffici tecnici: i cittadini verificati indicano quale fare prima. Il voto orienta il calendario dei lavori — e l'esito viene sempre raccontato."
        icon={<ListOrdered size={26} />}
      />

      {rounds.length === 0 ? (
        <EmptyState
          title="Nessuna tornata di voto"
          description="Quando il Comune metterà in fila più interventi possibili, qui sceglierai da quale partire."
        />
      ) : (
        <div className="space-y-6 stagger">
          {rounds.map((r) => {
            const st = priorityStatus(r.status);
            return (
              <Card key={r.id} className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={st.color}>{st.label}</Badge>
                  <span className="text-xs tabular-nums text-muted-2">
                    {formatNumber(r.totalVotes)} voti totali
                  </span>
                  {r.closesAt ? (
                    <span
                      className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-2"
                      suppressHydrationWarning
                    >
                      <CalendarClock size={13} aria-hidden />
                      {r.status === "aperta"
                        ? `si vota fino al ${formatDate(r.closesAt)}`
                        : `chiusa il ${formatDate(r.closesAt)}`}
                    </span>
                  ) : null}
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">{r.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.description}</p>
                </div>

                <PriorityVotePanel round={r} canVote={isVerified(user)} />

                {r.resultNote ? (
                  <div className="rounded-[var(--radius-sm)] border-l-2 border-teal bg-surface-2/60 px-3.5 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
                      🏛️ Cosa ne è stato
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{r.resultNote}</p>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          Tornate <strong>dimostrative</strong>: in una versione reale gli
          interventi arriverebbero dal piano delle manutenzioni, con costi e
          tempi validati prima del voto.
        </p>
      </Card>
    </div>
  );
}
