"use client";

import { useActionState } from "react";
import {
  notaRedazioneAction,
  type RedazioneState,
} from "@/app/actions/redazione";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Field, Input } from "@/components/ui/input";
import { NOTA_TESTO_MAX } from "@/lib/redazione";

/*
  Il modulo della Nota della Redazione (R-4). Fonte e data di consultazione
  sono obbligatorie QUI, prima ancora che alla resa: una nota senza fonte non
  deve nemmeno riuscire a nascere (actions/redazione.ts la rifiuta comunque,
  e il renderer pure — tre livelli, nessuno di cortesia).
*/

export function ModuloNota({
  servizi,
}: {
  servizi: { id: string; nome: string }[];
}) {
  const [stato, invia] = useActionState<RedazioneState, FormData>(
    notaRedazioneAction,
    undefined,
  );

  if (stato?.ok) {
    return (
      <p role="status" className="text-sm text-muted">
        Nota pubblicata sulla scheda, firmata come entità collettiva.
      </p>
    );
  }

  return (
    <form action={invia} className="space-y-3">
      {stato?.error ? <Alert>{stato.error}</Alert> : null}

      <Field label="Servizio" htmlFor="nota-servizio">
        <select
          id="nota-servizio"
          name="servizioId"
          required
          className="h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-foreground transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]"
        >
          {servizi.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Testo della nota" htmlFor="nota-testo">
        <textarea
          id="nota-testo"
          name="testo"
          rows={3}
          required
          maxLength={NOTA_TESTO_MAX}
          placeholder="Aggiunge un dato alla scheda, non risponde: la risposta è del Comune."
          className="w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-2 transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]"
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="URL della fonte (obbligatorio)" htmlFor="nota-fonte">
          <Input
            id="nota-fonte"
            name="urlFonte"
            type="url"
            required
            placeholder="https://…"
          />
        </Field>
        <Field label="Consultata il (obbligatorio)" htmlFor="nota-data">
          <Input id="nota-data" name="dataConsultazione" type="date" required />
        </Field>
      </div>

      <SubmitButton pendingText="Invio…">Pubblica la nota</SubmitButton>
    </form>
  );
}
