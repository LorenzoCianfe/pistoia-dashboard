"use client";

import { cn } from "@/lib/utils";

/**
 * Inline error line for optimistic actions (e.g. rate-limit refusals).
 * The live region stays mounted even when empty: screen readers often ignore
 * content injected together with its container, so the element must pre-exist
 * for the announcement to fire (WCAG 4.1.3).
 */
export function ActionError({
  error,
  className,
}: {
  error: string | null;
  className?: string;
}) {
  return (
    <span
      role="status"
      className={cn(
        error
          ? "mt-1 block text-xs font-medium text-[var(--red)]"
          : "sr-only",
        className,
      )}
    >
      {error ?? ""}
    </span>
  );
}
