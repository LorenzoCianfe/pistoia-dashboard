"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  createReportAction,
  type ReportFormState,
} from "@/app/actions/reports";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { REPORT_CATEGORY } from "@/lib/community";
import type { NeighborhoodOption } from "@/lib/data/neighborhoods";

const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-foreground focus-visible:border-teal focus-visible:outline-none";

export function ReportComposer({
  neighborhoods,
  defaultNeighborhoodId,
}: {
  neighborhoods: NeighborhoodOption[];
  defaultNeighborhoodId?: string | null;
}) {
  const router = useRouter();
  const [state, action] = useActionState<ReportFormState, FormData>(
    createReportAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      if (state.id) router.push(`/segnalazioni/${state.id}`);
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3.5">
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <Field label="Titolo" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder="Es. Lampione spento in Via…"
        />
      </Field>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Categoria" htmlFor="category">
          <select id="category" name="category" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Scegli…
            </option>
            {Object.entries(REPORT_CATEGORY).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quartiere / frazione" htmlFor="neighborhoodId">
          <select
            id="neighborhoodId"
            name="neighborhoodId"
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
        </Field>
      </div>

      <Field label="Posizione (indirizzo)" htmlFor="location">
        <Input id="location" name="location" maxLength={160} placeholder="Es. Via Ciliegiole, incrocio Via di Gello" />
      </Field>

      <Field label="Descrizione" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          maxLength={1000}
          placeholder="Descrivi il problema: cosa, dove, da quanto tempo…"
          className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-2">
          La tua segnalazione sarà pubblica e tracciabile.
        </span>
        <SubmitButton pendingText="Invio…">
          <Plus size={16} />
          Invia segnalazione
        </SubmitButton>
      </div>
    </form>
  );
}
