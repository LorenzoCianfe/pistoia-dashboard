"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import { ChevronUp, Send } from "lucide-react";
import {
  askQuestionAction,
  toggleQtVoteAction,
  type QuestionActionState,
} from "@/app/actions/territorio";
import { cn } from "@/lib/utils";

/* Interazioni del question time (A2 §22): voto alle domande e nuova domanda. */

export function QtVoteButton({
  questionId,
  votes,
  voted,
  open,
}: {
  questionId: string;
  votes: number;
  voted: boolean;
  open: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic({ votes, voted }, (prev) => ({
    votes: prev.voted ? prev.votes - 1 : prev.votes + 1,
    voted: !prev.voted,
  }));

  if (!open) {
    return (
      <span
        className="grid w-12 shrink-0 place-items-center gap-0 rounded-[var(--radius-sm)] border border-border py-2 text-center"
        aria-label={`${state.votes} voti`}
      >
        <span className="text-sm font-bold tabular-nums">{state.votes}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-2">voti</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={state.voted}
      aria-label={state.voted ? "Togli il voto a questa domanda" : "Vota questa domanda"}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(undefined);
          await toggleQtVoteAction(questionId);
        })
      }
      className={cn(
        "grid w-12 shrink-0 place-items-center rounded-[var(--radius-sm)] border py-1.5 transition-colors",
        state.voted
          ? "border-transparent bg-teal text-white"
          : "border-border text-muted hover:border-teal hover:text-teal",
      )}
    >
      <ChevronUp size={15} aria-hidden />
      <span className="text-sm font-bold leading-none tabular-nums">{state.votes}</span>
    </button>
  );
}

export function QtAskForm({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState<QuestionActionState, FormData>(
    askQuestionAction.bind(null, sessionId),
    undefined,
  );
  const [length, setLength] = useState(0);

  return (
    <form action={formAction} className="space-y-2">
      <label htmlFor={`qt-body-${sessionId}`} className="text-sm font-semibold">
        Fai la tua domanda
      </label>
      <textarea
        id={`qt-body-${sessionId}`}
        name="body"
        rows={2}
        maxLength={400}
        required
        onChange={(e) => setLength(e.target.value.length)}
        placeholder="Chiara e concreta: le domande più votate ricevono risposta ufficiale."
        className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-2 focus:border-teal"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-2" aria-live="polite">
          {state?.error ? (
            <span className="font-medium text-[var(--red)]">{state.error}</span>
          ) : state?.ok ? (
            <span className="font-medium text-teal">Domanda pubblicata. Ora può essere votata.</span>
          ) : (
            `${length}/400`
          )}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="gradient-teal-viola inline-flex h-9 items-center gap-1.5 rounded-pill px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-105 disabled:opacity-60"
        >
          <Send size={14} aria-hidden />
          {pending ? "Invio…" : "Invia la domanda"}
        </button>
      </div>
    </form>
  );
}
