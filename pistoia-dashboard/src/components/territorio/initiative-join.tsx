"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, HandHeart } from "lucide-react";
import { toggleInitiativeJoinAction } from "@/app/actions/territorio";
import { cn } from "@/lib/utils";

/* Adesione a un'iniziativa di volontariato (A2 §14): toggle ottimistico. */

export function InitiativeJoinButton({
  initiativeId,
  joined,
  joins,
  open,
  full,
}: {
  initiativeId: string;
  joined: boolean;
  joins: number;
  open: boolean;
  full: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic({ joined, joins }, (prev) => ({
    joined: !prev.joined,
    joins: prev.joined ? prev.joins - 1 : prev.joins + 1,
  }));
  const [error, setError] = useState<string | null>(null);

  // Già concluse o al completo (e non sono tra i partecipanti): niente bottone.
  if (!open && !state.joined) {
    return (
      <span className="text-xs font-medium text-muted-2">
        {state.joins} partecipanti
      </span>
    );
  }
  if (full && !state.joined) {
    return (
      <span className="text-xs font-medium text-muted-2">
        Posti esauriti · {state.joins} adesioni
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        disabled={pending}
        aria-pressed={state.joined}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            setOptimistic(undefined);
            const res = await toggleInitiativeJoinAction(initiativeId);
            if (!res?.ok) {
              setError(res && "error" in res ? (res.error ?? null) : "Riprova tra poco.");
            }
          });
        }}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-pill px-4 text-sm font-semibold transition-colors",
          state.joined
            ? "bg-teal text-white hover:brightness-105"
            : "border border-border-strong text-foreground hover:border-teal hover:text-teal",
        )}
      >
        {state.joined ? <Check size={15} aria-hidden /> : <HandHeart size={15} aria-hidden />}
        {state.joined ? "Partecipo" : "Partecipa"}
      </button>
      <span className="text-xs tabular-nums text-muted">
        {state.joins} {state.joins === 1 ? "adesione" : "adesioni"}
      </span>
      {error ? (
        <span className="text-xs font-medium text-[var(--red)]" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
