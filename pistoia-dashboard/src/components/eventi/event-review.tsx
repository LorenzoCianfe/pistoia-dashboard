"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { reviewEventAction } from "@/app/actions/events";

export function EventReview({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<null | "approved" | "rejected">(null);

  function review(approve: boolean) {
    startTransition(async () => {
      await reviewEventAction(eventId, approve);
      setDone(approve ? "approved" : "rejected");
    });
  }

  if (done) {
    return (
      <span className="text-xs font-medium text-muted-2">
        {done === "approved" ? "Approvato" : "Rifiutato"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => review(true)}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-pill bg-[var(--green-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--green)] disabled:opacity-60"
      >
        <Check size={13} /> Approva
      </button>
      <button
        type="button"
        onClick={() => review(false)}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-pill border border-border px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-[var(--red)] disabled:opacity-60"
      >
        <X size={13} /> Rifiuta
      </button>
    </div>
  );
}
