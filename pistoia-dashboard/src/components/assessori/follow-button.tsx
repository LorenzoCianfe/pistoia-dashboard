"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleFollowAction } from "@/app/actions/assessori";
import { FollowToggle } from "@/components/ui/follow-toggle";

/**
 * "Segui" per gli assessori.
 *
 * Resta separato dal pulsante generico perché lo è lo strato dati: gli
 * assessori hanno `AssessoreFollow`, con una chiave esterna vera verso
 * `Assessore`, mentre il resto passa dalla tabella polimorfica `Follow`.
 * L'aspetto è condiviso in `FollowToggle`.
 */
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
    <FollowToggle
      following={optimistic}
      pending={pending}
      onClick={toggle}
      error={error}
      className={className}
    />
  );
}
