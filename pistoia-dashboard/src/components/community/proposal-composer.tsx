"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import {
  createProposalAction,
  type ProposalFormState,
} from "@/app/actions/proposals";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { NeighborhoodOption } from "@/lib/data/neighborhoods";

const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-foreground focus-visible:border-teal focus-visible:outline-none";

const CATEGORIES = ["Mobilità", "Verde", "Ambiente", "Cultura", "Sport", "Sociale", "Decoro", "Sicurezza"];

export function ProposalComposer({
  neighborhoods,
  defaultNeighborhoodId,
}: {
  neighborhoods: NeighborhoodOption[];
  defaultNeighborhoodId?: string | null;
}) {
  const router = useRouter();
  const [state, action] = useActionState<ProposalFormState, FormData>(
    createProposalAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      if (state.id) router.push(`/proposte/${state.id}`);
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3.5">
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <Field label="Titolo della proposta" htmlFor="title">
        <Input id="title" name="title" required maxLength={140} placeholder="Es. Una fontanella in Piazza…" />
      </Field>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Ambito" htmlFor="category">
          <select id="category" name="category" defaultValue="" className={selectClass}>
            <option value="">Generale</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
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

      <Field label="Descrizione" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          maxLength={1200}
          placeholder="Spiega la tua idea per la città: cosa proponi e perché."
          className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-2">
          Al raggiungimento delle soglie di sostegno, il Comune risponde.
        </span>
        <SubmitButton pendingText="Invio…">
          <Lightbulb size={16} />
          Pubblica proposta
        </SubmitButton>
      </div>
    </form>
  );
}
