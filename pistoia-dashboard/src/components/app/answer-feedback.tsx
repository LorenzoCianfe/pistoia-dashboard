"use client";

import { useOptimistic, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { answerFeedbackAction, type FeedbackTarget } from "@/app/actions/feedback";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type State = { count: number; vote: boolean | null };

function reduce(s: State, clicked: boolean): State {
  // Clicking the active choice again clears the vote.
  if (s.vote === clicked) {
    return { count: clicked ? s.count - 1 : s.count, vote: null };
  }
  let count = s.count;
  if (s.vote === true && clicked === false) count -= 1; // moved off "helpful"
  if (s.vote !== true && clicked === true) count += 1; // moved onto "helpful"
  return { count, vote: clicked };
}

/**
 * "Questa risposta ti è stata utile?" control for an official Comune answer (§8).
 * Reusable across the community feed, proposals and reports.
 */
export function AnswerFeedback({
  targetType,
  targetId,
  helpfulCount,
  myVote,
  className,
}: {
  targetType: FeedbackTarget;
  targetId: string;
  helpfulCount: number;
  myVote: boolean | null;
  className?: string;
}) {
  const [state, dispatch] = useOptimistic({ count: helpfulCount, vote: myVote }, reduce);
  const [pending, startTransition] = useTransition();

  function vote(helpful: boolean) {
    startTransition(async () => {
      dispatch(helpful);
      await answerFeedbackAction(targetType, targetId, helpful);
    });
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs", className)}>
      <span className="text-muted-2">Questa risposta ti è stata utile?</span>
      <button
        type="button"
        onClick={() => vote(true)}
        disabled={pending}
        aria-pressed={state.vote === true}
        className={cn(
          "inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 font-semibold transition-colors disabled:opacity-60",
          state.vote === true
            ? "border-transparent bg-[var(--green-soft)] text-[var(--green)]"
            : "border-border text-muted hover:text-foreground",
        )}
      >
        <ThumbsUp size={13} />
        Sì
        {state.count > 0 ? (
          <span className="tabular-nums">· {formatNumber(state.count)}</span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => vote(false)}
        disabled={pending}
        aria-pressed={state.vote === false}
        className={cn(
          "inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 font-semibold transition-colors disabled:opacity-60",
          state.vote === false
            ? "border-transparent bg-surface-2 text-foreground"
            : "border-border text-muted hover:text-foreground",
        )}
      >
        <ThumbsDown size={13} />
        No
      </button>
    </div>
  );
}
