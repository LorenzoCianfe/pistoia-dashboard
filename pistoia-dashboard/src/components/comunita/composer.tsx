"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { createPostAction, type FeedActionState } from "@/app/actions/community";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SubmitButton } from "@/components/ui/submit-button";

export function Composer({
  name,
  color,
}: {
  name: string;
  color: string;
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
              aria-label="Scrivi una domanda pubblica al Comune"
              placeholder="Fai una domanda pubblica al Comune…"
              className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]"
            />
            {state?.error ? (
              <p className="mt-1 text-xs font-medium text-[var(--red)]">
                {state.error}
              </p>
            ) : null}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-2">
                Visibile a tutti i cittadini
              </span>
              <SubmitButton size="sm" pendingText="Invio…">
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
