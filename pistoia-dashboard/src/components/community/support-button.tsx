"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Heart, Check, Lock } from "lucide-react";
import { motion } from "motion/react";
import { supportProposalAction } from "@/app/actions/proposals";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Support a proposal — verified citizens only (gated per the access table). */
export function SupportButton({
  proposalId,
  supported,
  count,
  canSupport,
  full = false,
}: {
  proposalId: string;
  supported: boolean;
  count: number;
  canSupport: boolean;
  full?: boolean;
}) {
  const [state, toggleOptimistic] = useOptimistic(
    { supported, count },
    (s) => ({
      supported: !s.supported,
      count: s.supported ? s.count - 1 : s.count + 1,
    }),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canSupport) {
    return (
      <Link
        href="/profilo?verifica=richiesta"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-pill border border-border-strong bg-surface px-3.5 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2",
          full && "w-full",
        )}
        title="Verificati per supportare le proposte"
      >
        <Lock size={15} />
        Verificati per supportare
        <span className="tabular-nums opacity-80">· {formatNumber(count)}</span>
      </Link>
    );
  }

  function toggle() {
    setError(null);
    startTransition(async () => {
      toggleOptimistic(undefined);
      const res = await supportProposalAction(proposalId);
      if (res && "error" in res && res.error) setError(res.error);
    });
  }

  return (
    <div className={cn(full && "w-full")}>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={state.supported}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-pill px-4 py-1.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60",
          full && "w-full",
          state.supported
            ? "border border-border bg-surface-2 text-foreground"
            : "gradient-teal-viola text-white",
        )}
      >
        <motion.span whileTap={{ scale: 0.85 }} className="grid place-items-center">
          {state.supported ? <Check size={15} strokeWidth={2.5} /> : <Heart size={15} />}
        </motion.span>
        {state.supported ? "Sostieni" : "Sostieni"}
        <span className="tabular-nums opacity-80">· {formatNumber(state.count)}</span>
      </button>
      {error ? (
        <p className="mt-1 text-xs font-medium text-[var(--red)]">{error}</p>
      ) : null}
    </div>
  );
}
