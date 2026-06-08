"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPollAction, type AdminState } from "@/app/actions/admin";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function CreatePollForm() {
  const [state, action] = useActionState<AdminState, FormData>(
    createPollAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state?.ok ? (
        <Alert variant="success">Sondaggio pubblicato.</Alert>
      ) : state?.error ? (
        <Alert>{state.error}</Alert>
      ) : null}

      <Field label="Domanda" htmlFor="question">
        <Input
          id="question"
          name="question"
          required
          maxLength={160}
          placeholder="Es. Dove preferiresti un nuovo parco?"
        />
      </Field>

      <Field label="Categoria" htmlFor="category">
        <Input
          id="category"
          name="category"
          maxLength={40}
          placeholder="Es. Priorità 2026"
        />
      </Field>

      <div className="space-y-2">
        <span className="text-sm font-medium">Opzioni</span>
        {[0, 1, 2, 3].map((i) => (
          <Input
            key={i}
            name="option"
            maxLength={60}
            placeholder={`Opzione ${i + 1}${i < 2 ? "" : " (facoltativa)"}`}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingText="Pubblicazione…">Crea sondaggio</SubmitButton>
      </div>
    </form>
  );
}
