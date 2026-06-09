"use client";

import { useOptimistic, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { toggleFollowAction, type FollowTarget } from "@/app/actions/follow";
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

  function toggle() {
    startTransition(async () => {
      setOptimistic(!optimistic);
      await toggleFollowAction(targetType, targetId);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={optimistic}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill font-semibold transition-all active:scale-[0.98] disabled:opacity-60",
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
  );
}
