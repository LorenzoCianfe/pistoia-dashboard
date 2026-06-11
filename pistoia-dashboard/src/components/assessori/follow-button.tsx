"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { toggleFollowAction } from "@/app/actions/assessori";
import { ActionError } from "@/components/ui/action-error";
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
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      setOptimistic(!optimistic);
      const res = await toggleFollowAction(assessoreId);
      if (res && "error" in res && res.error) setError(res.error);
    });
  }

  return (
    <>
    <button
      type="button"
      onClick={toggle}
      aria-disabled={pending}
      aria-pressed={optimistic}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-pill px-4 text-sm font-semibold transition-all active:scale-[0.98]",
        pending && "opacity-60",
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
    <ActionError error={error} />
    </>
  );
}
