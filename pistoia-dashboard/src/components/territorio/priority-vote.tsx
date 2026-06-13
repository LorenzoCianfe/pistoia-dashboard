"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { votePriorityAction } from "@/app/actions/territorio";
import type { PriorityRoundItem } from "@/lib/data/territorio";
import { reportCategory } from "@/lib/community";
import { toPercents } from "@/lib/percent";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/*
  "Vota la priorità" (A2 §9): un voto per tornata, spostabile finché la
  tornata è aperta. Le barre mostrano la classifica in tempo reale.
*/

type VoteState = Pick<PriorityRoundItem, "items" | "myVoteItemId" | "totalVotes">;

function applyVote(prev: VoteState, itemId: string): VoteState {
  const prevId = prev.myVoteItemId;
  const retiro = prevId === itemId;
  const items = prev.items.map((i) => {
    let votes = i.votes;
    if (i.id === itemId && !retiro) votes += 1;
    if (i.id === prevId) votes -= 1;
    return { ...i, votes };
  });
  return {
    items,
    myVoteItemId: retiro ? null : itemId,
    totalVotes: items.reduce((s, i) => s + i.votes, 0),
  };
}

export function PriorityVotePanel({
  round,
  canVote,
}: {
  round: PriorityRoundItem;
  canVote: boolean;
}) {
  const open = round.status === "aperta";
  const [state, addOptimistic] = useOptimistic<VoteState, string>(
    { items: round.items, myVoteItemId: round.myVoteItemId, totalVotes: round.totalVotes },
    applyVote,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const ordered = [...state.items].sort((a, b) => b.votes - a.votes);
  const percents = toPercents(ordered.map((i) => i.votes));

  function vote(itemId: string) {
    if (!open || !canVote || pending) return;
    setError(null);
    startTransition(async () => {
      addOptimistic(itemId);
      const res = await votePriorityAction(round.id, itemId);
      if (!res?.ok) {
        setError(res?.error ?? "Non è stato possibile registrare il voto. Riprova.");
      }
    });
  }

  return (
    <div className="space-y-2.5">
      {ordered.map((item, idx) => {
        const cat = reportCategory(item.category);
        const mine = state.myVoteItemId === item.id;
        const row = (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-semibold leading-snug">
                {item.title}
                {mine ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-teal">
                    <Check size={12} aria-hidden /> il tuo voto
                  </span>
                ) : null}
              </p>
              <p className="text-xs tabular-nums text-muted">
                <strong className="text-sm text-foreground">{percents[idx]}%</strong> · {item.votes} voti
              </p>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-2">{item.description}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-2" aria-hidden>
              <div
                className={cn(
                  "h-full rounded-pill transition-[width] duration-500",
                  mine ? "gradient-teal-viola" : "bg-border-strong",
                )}
                style={{ width: `${percents[idx]}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge color={cat.color} className="px-2 py-0.5 text-[11px]">
                {cat.label}
              </Badge>
              {item.neighborhoodLabel ? (
                <span className="text-[11px] text-muted-2">{item.neighborhoodLabel}</span>
              ) : null}
            </div>
          </>
        );

        if (!open || !canVote) {
          return (
            <div key={item.id} className="rounded-[var(--radius-sm)] border border-border p-3.5">
              {row}
            </div>
          );
        }
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => vote(item.id)}
            disabled={pending}
            aria-pressed={mine}
            className={cn(
              "block w-full rounded-[var(--radius-sm)] border p-3.5 text-left transition-colors",
              mine ? "border-teal bg-teal-soft/40" : "border-border hover:border-teal/50",
            )}
          >
            {row}
          </button>
        );
      })}

      {error ? (
        <p className="text-sm font-medium text-[var(--red)]" role="alert">
          {error}
        </p>
      ) : null}
      {open && !canVote ? (
        <p className="text-xs text-muted">
          Il voto è riservato ai profili verificati (gli interventi sono già validati dagli uffici).{" "}
          <Link href="/profilo" className="font-semibold text-teal hover:underline">
            Verifica il tuo profilo →
          </Link>
        </p>
      ) : null}
      {open && canVote ? (
        <p className="text-xs text-muted-2">
          Un voto per tornata: puoi spostarlo finché la votazione è aperta; un secondo clic sulla stessa voce lo ritira.
        </p>
      ) : null}
    </div>
  );
}
