"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarPlus, Plus } from "lucide-react";
import { createEventAction, type EventFormState } from "@/app/actions/events";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { EVENT_CATEGORY } from "@/lib/community";
import type { NeighborhoodOption } from "@/lib/data/neighborhoods";

const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-foreground focus-visible:border-teal focus-visible:outline-none";

export function EventComposer({
  neighborhoods,
  needsApproval,
}: {
  neighborhoods: NeighborhoodOption[];
  needsApproval: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<EventFormState, FormData>(
    createEventAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-pill gradient-teal-viola px-4 py-2.5 text-sm font-semibold text-white"
      >
        <CalendarPlus size={16} />
        Proponi un evento
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-3.5">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.ok ? (
        <div className="rounded-[var(--radius-sm)] border border-[var(--green)]/30 bg-[var(--green-soft)] px-3.5 py-2.5 text-sm text-[var(--green)]">
          {needsApproval
            ? "Evento inviato: sarà pubblicato dopo l'approvazione del Comune."
            : "Evento pubblicato nel calendario."}
        </div>
      ) : null}

      <Field label="Titolo" htmlFor="ev-title">
        <Input id="ev-title" name="title" required maxLength={120} placeholder="Es. Mercato contadino in piazza" />
      </Field>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Categoria" htmlFor="ev-category">
          <select id="ev-category" name="category" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Scegli…
            </option>
            {Object.entries(EVENT_CATEGORY).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quartiere / frazione" htmlFor="ev-neighborhood">
          <select id="ev-neighborhood" name="neighborhoodId" defaultValue="" className={selectClass}>
            <option value="">Tutta la città</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Inizio" htmlFor="ev-start">
          <Input id="ev-start" name="startAt" type="datetime-local" required />
        </Field>
        <Field label="Fine (opzionale)" htmlFor="ev-end">
          <Input id="ev-end" name="endAt" type="datetime-local" />
        </Field>
      </div>

      <Field label="Luogo" htmlFor="ev-location">
        <Input id="ev-location" name="location" maxLength={160} placeholder="Es. Piazza del Duomo" />
      </Field>

      <Field label="Descrizione" htmlFor="ev-description">
        <textarea
          id="ev-description"
          name="description"
          rows={3}
          required
          maxLength={1500}
          placeholder="Descrivi l'evento: cosa, per chi, dettagli utili…"
          className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-muted-2 hover:text-foreground"
        >
          Annulla
        </button>
        <SubmitButton pendingText="Invio…">
          <Plus size={16} />
          {needsApproval ? "Invia per approvazione" : "Pubblica evento"}
        </SubmitButton>
      </div>
    </form>
  );
}
