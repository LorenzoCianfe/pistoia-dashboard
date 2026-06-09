"use client";

import { useActionState, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  requestVerificationAction,
  type VerificationState,
} from "@/app/actions/verification";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { VERIFICATION, REQUESTABLE_VERIFICATIONS } from "@/lib/community";

const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-foreground focus-visible:border-teal focus-visible:outline-none";

export function VerificationRequest() {
  const [state, action] = useActionState<VerificationState, FormData>(
    requestVerificationAction,
    undefined,
  );
  const [type, setType] = useState<string>("IDENTITY");
  const needsOrg = type === "ASSOCIATION" || type === "BUSINESS";

  return (
    <form action={action} className="space-y-3.5">
      {state?.ok ? (
        <Alert variant="success">
          Richiesta inviata. Il Comune la esaminerà a breve (verifica simulata in questa fase).
        </Alert>
      ) : null}
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <Field label="Tipo di verifica" htmlFor="type">
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={selectClass}
        >
          {REQUESTABLE_VERIFICATIONS.map((t) => (
            <option key={t} value={t}>
              {VERIFICATION[t].emoji} {VERIFICATION[t].label}
            </option>
          ))}
        </select>
      </Field>

      {needsOrg ? (
        <Field label="Nome dell'organizzazione" htmlFor="organizationName">
          <Input
            id="organizationName"
            name="organizationName"
            required
            maxLength={120}
            placeholder="Es. Associazione Amici del Parco"
          />
        </Field>
      ) : null}

      <Field label="Nota (facoltativa)" htmlFor="note">
        <textarea
          id="note"
          name="note"
          rows={2}
          maxLength={300}
          placeholder="Aggiungi un dettaglio utile alla verifica…"
          className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
        />
      </Field>

      <SubmitButton size="sm" pendingText="Invio…">
        <ShieldCheck size={15} />
        Richiedi verifica
      </SubmitButton>
    </form>
  );
}
