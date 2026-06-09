"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { createPostAction, type FeedActionState } from "@/app/actions/community";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SubmitButton } from "@/components/ui/submit-button";
import { POST_KIND } from "@/lib/community";
import type { NeighborhoodOption } from "@/lib/data/neighborhoods";

const selectClass =
  "h-9 rounded-pill border border-border-strong bg-surface px-3 text-xs font-medium text-foreground focus-visible:border-teal focus-visible:outline-none";

export function Composer({
  name,
  color,
  neighborhoods,
  defaultNeighborhoodId,
}: {
  name: string;
  color: string;
  neighborhoods: NeighborhoodOption[];
  defaultNeighborhoodId?: string | null;
}) {
  const [state, action] = useActionState<FeedActionState, FormData>(
    createPostAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <Card>
      <form ref={formRef} action={action}>
        <div className="flex gap-3">
          <Avatar name={name} color={color} />
          <div className="flex-1">
            <textarea
              name="content"
              rows={2}
              maxLength={500}
              aria-label="Scrivi alla community e al Comune"
              placeholder="Fai una domanda, proponi un'idea o avvia una discussione…"
              className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]"
            />
            {state?.error ? (
              <p className="mt-1 text-xs font-medium text-[var(--red)]">{state.error}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select name="kind" aria-label="Tipo di post" defaultValue="domanda" className={selectClass}>
                {Object.entries(POST_KIND).map(([key, k]) => (
                  <option key={key} value={key}>
                    {k.label}
                  </option>
                ))}
              </select>
              <select
                name="neighborhoodId"
                aria-label="Quartiere"
                defaultValue={defaultNeighborhoodId ?? ""}
                className={selectClass}
              >
                <option value="">Tutta la città</option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
              <SubmitButton size="sm" pendingText="Invio…" className="ml-auto">
                <Send size={15} />
                Pubblica
              </SubmitButton>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
