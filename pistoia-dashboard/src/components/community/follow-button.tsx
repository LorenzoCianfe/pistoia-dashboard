"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { toggleFollowAction, type FollowTarget } from "@/app/actions/follow";
import { ActionError } from "@/components/ui/action-error";
import { cn } from "@/lib/utils";

export function FollowButton({
  targetType,
  targetId,
  following,
  size = "md",
  className,
}: {
  targetType: FollowTarget;
  targetId: string;
  following: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(
    following,
    (_c, value: boolean) => value,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      setOptimistic(!optimistic);
      const res = await toggleFollowAction(targetType, targetId);
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
        "inline-flex items-center gap-1.5 rounded-pill font-semibold transition-all active:scale-[0.98]",
        pending && "opacity-60",
        size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
        optimistic
          ? "border border-border bg-surface-2 text-foreground"
          : "gradient-teal-viola text-white",
        className,
      )}
    >
      {optimistic ? (
        <>
          <Check size={14} strokeWidth={2.5} />
          Segui già
        </>
      ) : (
        <>
          <Plus size={14} strokeWidth={2.5} />
          Segui
        </>
      )}
    </button>
    <ActionError error={error} />
    </>
  );
}
