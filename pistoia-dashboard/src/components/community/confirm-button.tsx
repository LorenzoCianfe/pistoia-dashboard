"use client";

import { useOptimistic, useTransition } from "react";
import { Users, Check } from "lucide-react";
import { motion } from "motion/react";
import { confirmReportAction } from "@/app/actions/reports";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** "Anche io" — confirm an existing report to dedupe and signal priority. */
export function ConfirmButton({
  reportId,
  confirmed,
  count,
  full = false,
}: {
  reportId: string;
  confirmed: boolean;
  count: number;
  full?: boolean;
}) {
  const [state, toggleOptimistic] = useOptimistic(
    { confirmed, count },
    (s) => ({
      confirmed: !s.confirmed,
      count: s.confirmed ? s.count - 1 : s.count + 1,
    }),
  );
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      toggleOptimistic(undefined);
      await confirmReportAction(reportId);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={state.confirmed}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill border px-3.5 py-1.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60",
        full && "w-full",
        state.confirmed
          ? "border-transparent bg-teal-soft text-teal"
          : "border-border-strong bg-surface text-foreground hover:bg-surface-2",
      )}
    >
      <motion.span whileTap={{ scale: 0.85 }} className="grid place-items-center">
        {state.confirmed ? <Check size={16} strokeWidth={2.5} /> : <Users size={16} />}
      </motion.span>
      {state.confirmed ? "Anche tu confermi" : "Anche io"}
      <span className="tabular-nums opacity-80">· {formatNumber(state.count)}</span>
    </button>
  );
}
