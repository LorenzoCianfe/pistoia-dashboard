"use client";

import { useOptimistic, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { toggleFollowAction } from "@/app/actions/assessori";
import { cn } from "@/lib/utils";

export function FollowButton({
  assessoreId,
  following,
  className,
}: {
  assessoreId: string;
  following: boolean;
  className?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(
    following,
    (_current, value: boolean) => value,
  );
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setOptimistic(!optimistic);
      await toggleFollowAction(assessoreId);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={optimistic}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-pill px-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60",
        optimistic
          ? "border border-border bg-surface-2 text-foreground"
          : "gradient-teal-viola text-white",
        className,
      )}
    >
      {optimistic ? (
        <>
          <Check size={15} strokeWidth={2.5} />
          Segui già
        </>
      ) : (
        <>
          <Plus size={15} strokeWidth={2.5} />
          Segui
        </>
      )}
    </button>
  );
}
