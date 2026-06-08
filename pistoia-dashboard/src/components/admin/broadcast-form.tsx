"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  broadcastNotificationAction,
  type AdminState,
} from "@/app/actions/admin";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function BroadcastForm() {
  const [state, action] = useActionState<AdminState, FormData>(
    broadcastNotificationAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state?.ok ? (
        <Alert variant="success">Notifica inviata a tutti i cittadini.</Alert>
      ) : state?.error ? (
        <Alert>{state.error}</Alert>
      ) : null}

      <Field label="Titolo" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          maxLength={80}
          placeholder="Es. Nuovo sondaggio disponibile"
        />
      </Field>

      <Field label="Messaggio" htmlFor="body">
        <Input
          id="body"
          name="body"
          required
          maxLength={200}
          placeholder="Es. Vota la priorità per il 2026."
        />
      </Field>

      <Field label="Link (facoltativo)" htmlFor="href">
        <Input id="href" name="href" maxLength={120} placeholder="/sondaggi" />
      </Field>

      <div className="flex justify-end">
        <SubmitButton pendingText="Invio…">Invia a tutti</SubmitButton>
      </div>
    </form>
  );
}
