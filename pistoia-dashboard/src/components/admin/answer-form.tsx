"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { answerPostAction, type AdminState } from "@/app/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { DEPARTMENTS } from "@/lib/community";

/*
  IL MODULO DI RISPOSTA A **UNA** DOMANDA.

  Chi ha chiesto e che cosa ha chiesto li rende la pagina: sono un Server
  Component, e prima viaggiavano al browser dentro questo componente client una
  volta per domanda in coda.
*/
export function AnswerForm({ postId }: { postId: string }) {
  const [state, action] = useActionState<AdminState, FormData>(
    answerPostAction,
    undefined,
  );

  return (
    <div>
      {state?.ok ? (
        <Alert variant="success" className="mt-3">
          Risposta pubblicata.
        </Alert>
      ) : (
        <form action={action} className="mt-3 space-y-2">
          <input type="hidden" name="postId" value={postId} />
          {state?.error ? (
            <p className="text-xs font-medium text-[var(--red)]">{state.error}</p>
          ) : null}
          <select
            name="department"
            defaultValue=""
            aria-label="Ufficio responsabile"
            /* `h-11` sono i 44px di `DESIGN.md` §11.6: era `h-9`, cioè 36. */
            className="h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm focus-visible:border-teal focus-visible:outline-none"
          >
            <option value="">Ufficio responsabile (facoltativo)…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <textarea
            name="body"
            rows={2}
            maxLength={600}
            required
            placeholder="Risposta ufficiale del Comune…"
            className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
          />
          <div className="flex justify-end">
            <SubmitButton size="sm" pendingText="Invio…">
              <Send size={14} />
              Pubblica risposta
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
