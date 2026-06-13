"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Users, FileText, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { voteAction } from "@/app/actions/polls";
import type { PollResult } from "@/lib/data/sondaggi";
import { accent } from "@/lib/colors";
import { formatNumber } from "@/lib/format";
import { toPercents } from "@/lib/percent";
import { cn } from "@/lib/utils";

function applyVote(poll: PollResult, chosenId: string): PollResult {
  const prev = poll.userOptionId;
  if (prev === chosenId) return poll;

  const options = poll.options.map((o) => {
    let votes = o.votes;
    if (o.id === chosenId) votes += 1;
    if (o.id === prev) votes -= 1;
    return { ...o, votes };
  });
  const total = options.reduce((s, o) => s + o.votes, 0) || 1;
  const percents = toPercents(options.map((o) => o.votes));
  return {
    ...poll,
    userOptionId: chosenId,
    totalVotes: total,
    options: options.map((o, i) => ({ ...o, percent: percents[i] })),
  };
}

export function PollCard({ poll }: { poll: PollResult }) {
  const [optimistic, addOptimistic] = useOptimistic(poll, applyVote);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function vote(optionId: string) {
    if (!poll.active || pending || optionId === optimistic.userOptionId) return;
    setError(null);
    startTransition(async () => {
      addOptimistic(optionId);
      const res = await voteAction(poll.id, optionId);
      if (res?.ok) {
        setToast(true);
        setTimeout(() => setToast(false), 2200);
      } else {
        // The optimistic vote has already rolled back; say why.
        setError(res?.error ?? "Non è stato possibile registrare il voto. Riprova.");
      }
    });
  }

  const leadingId = [...optimistic.options].sort((a, b) => b.votes - a.votes)[0]
    ?.id;

  return (
    <Card className="relative">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge color="viola" className="mb-2">
            {optimistic.category}
          </Badge>
          <h3 className="text-lg font-semibold leading-snug">
            {optimistic.question}
          </h3>
          {optimistic.description ? (
            <p className="mt-1 text-sm text-muted">{optimistic.description}</p>
          ) : null}
        </div>
      </div>

      {/* Consultazione con documento (A2 §23, O4): il documento di riferimento
          con la sua sintesi in linguaggio semplice, sopra le opzioni di voto. */}
      {optimistic.doc ? (
        <div className="mt-4 rounded-[var(--radius-sm)] border border-border bg-surface-2/50 p-4">
          <div className="flex items-center gap-2">
            <FileText size={15} className="shrink-0 text-viola" aria-hidden />
            <p className="text-sm font-semibold">{optimistic.doc.title}</p>
          </div>
          {optimistic.doc.summary ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{optimistic.doc.summary}</p>
          ) : null}
          {optimistic.doc.url ? (
            <a
              href={optimistic.doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
            >
              Leggi il documento completo
              <ExternalLink size={13} aria-hidden />
            </a>
          ) : null}
        </div>
      ) : null}

      <ul className="mt-4 space-y-2.5">
        {optimistic.options.map((o) => {
          const chosen = optimistic.userOptionId === o.id;
          const a = accent(o.color);
          const isLeading = !poll.active && o.id === leadingId;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => vote(o.id)}
                disabled={!poll.active}
                aria-disabled={!poll.active || pending}
                aria-pressed={chosen}
                className={cn(
                  "relative w-full overflow-hidden rounded-[var(--radius-sm)] border text-left transition-all",
                  poll.active && "hover:border-border-strong",
                  chosen ? "border-2" : "border-border",
                  !poll.active && "cursor-default",
                )}
                style={chosen ? { borderColor: a.fg } : undefined}
              >
                <motion.span
                  className="absolute inset-y-0 left-0"
                  style={{ backgroundColor: a.soft }}
                  initial={{ width: 0 }}
                  animate={{ width: `${o.percent}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="relative flex items-center justify-between gap-3 px-4 py-3">
                  <span className="flex items-center gap-2 font-medium">
                    {chosen ? (
                      <span
                        className="grid size-5 place-items-center rounded-full text-white"
                        style={{ backgroundColor: a.fg }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>
                    ) : (
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: a.fg }}
                      />
                    )}
                    {o.label}
                    {isLeading ? (
                      <span className="text-xs font-semibold text-muted-2">
                        · in testa
                      </span>
                    ) : null}
                  </span>
                  <span className="tabular-nums font-bold">{o.percent}%</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="mt-3 text-sm font-medium text-[var(--red)]">{error}</p>
      ) : null}

      {/* Persistent live region: must exist before the message for SR announcement. */}
      <div role="status" aria-live="polite" className="sr-only">
        {toast ? "Voto registrato" : error ?? ""}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-2">
        <span className="flex items-center gap-1.5">
          <Users size={13} />
          {formatNumber(optimistic.totalVotes)} voti
        </span>
        {!poll.active ? (
          <span>Sondaggio concluso</span>
        ) : optimistic.userOptionId ? (
          <span className="font-medium text-[var(--green)]">
            Hai votato · puoi cambiare
          </span>
        ) : (
          <span>Tocca un&apos;opzione per votare</span>
        )}
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-pill bg-[var(--green)] px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            <Check size={16} strokeWidth={3} />
            Voto registrato
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
