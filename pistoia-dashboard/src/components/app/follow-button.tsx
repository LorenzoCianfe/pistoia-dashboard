"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleFollowAction, type FollowTarget } from "@/app/actions/follow";
import { FollowToggle } from "@/components/ui/follow-toggle";

/** "Segui" per quartieri, opere, segnalazioni, proposte, sondaggi, eventi. */
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
    <FollowToggle
      following={optimistic}
      pending={pending}
      onClick={toggle}
      error={error}
      size={size}
      className={className}
    />
  );
}
