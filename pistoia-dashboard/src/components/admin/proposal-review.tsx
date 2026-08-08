"use client";

import { useActionState } from "react";
import {
  reviewProposalAction,
  type ProposalAdminState,
} from "@/app/actions/proposals";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { PROPOSAL_STATUS } from "@/lib/community";
import {
  IMPACT_SCALE,
  COST_SCALE,
  TIME_SCALE,
  FEASIBILITY_SCALE,
} from "@/lib/civic-topics";

/*
  IL MODULO DI VALUTAZIONE DI **UNA** PROPOSTA.

  Come per il triage, la lista è uscita di qui il 2026-08-07: erano quattro
  moduli identici da 389px in colonna, e il piano li dava per il debito peggiore
  dell'area (`docs/piano-admin.md` §6). Il merito — titolo, problema, testo,
  sostegni — lo rende la pagina, che è un Server Component.
*/
type Item = {
  id: string;
  status: string;
  estimatedImpact: string | null;
  estimatedCost: string | null;
  estimatedTime: string | null;
  feasibility: string | null;
};

// Select della valutazione sintetica (A1 §15): vuoto = non modificare.
const ASSESS_FIELDS = [
  { name: "estimatedImpact", label: "Impatto", scale: IMPACT_SCALE },
  { name: "estimatedCost", label: "Costo", scale: COST_SCALE },
  { name: "estimatedTime", label: "Tempo", scale: TIME_SCALE },
  { name: "feasibility", label: "Fattibilità", scale: FEASIBILITY_SCALE },
] as const;

// `h-11` sono i 44px di `DESIGN.md` §11.6: era `h-10`, cioè 40.
const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm focus-visible:border-teal focus-visible:outline-none";

const SETTABLE = ["pubblicata", "in_valutazione", "risposta", "approvata", "respinta"];

export function RevisioneProposta({ item }: { item: Item }) {
  const [state, action] = useActionState<ProposalAdminState, FormData>(
    reviewProposalAction,
    undefined,
  );

  return (
    <div>
      {state?.ok ? (
        <Alert variant="success" className="mt-3">
          Proposta aggiornata.
        </Alert>
      ) : (
        <form action={action} className="@container mt-3 space-y-2">
          <input type="hidden" name="proposalId" value={item.id} />
          {state?.error ? (
            <p className="text-xs font-medium text-[var(--red)]">{state.error}</p>
          ) : null}
          <select name="status" defaultValue={item.status} className={selectClass} aria-label="Stato">
            {SETTABLE.map((s) => (
              <option key={s} value={s}>
                {PROPOSAL_STATUS[s].label}
              </option>
            ))}
          </select>
          <textarea
            name="reply"
            rows={2}
            maxLength={800}
            placeholder="Risposta ufficiale del Comune (facoltativa)…"
            className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
          />
          {/*
            Due colonne solo dove ci stanno. A 360px in modalità semplice la
            colonna faceva ~140px e le quattro tendine leggevano «Impatto:
            Med…», «Fattibilità: Da…»: il valore corrente — cioè l'unica cosa
            che quel controllo comunica a riposo — era **tagliato a metà
            parola** su tutte e quattro. Non è un traboccamento, quindi `shots`
            esce 0; ed è a norma di dimensione, quindi `bersagli` lo approva.
            Visto guardando la schermata, come le altre di questa famiglia.

            `@sm:` e non `sm:` per la ragione detta in `report-triage.tsx`: qui
            si è larghi 479px nella colonna del dettaglio e ~303 su telefono, e
            la finestra non c'entra. `grid-cols-1` esplicito perché una variante
            con prefisso senza la sua base lascia la traccia a `auto`, cioè al
            min-content (`AGENTS.md` §3, ondata 7, 5).
          */}
          <fieldset className="grid grid-cols-1 gap-2 @sm:grid-cols-2">
            <legend className="pb-1 text-xs font-medium text-muted-2 @sm:col-span-2">
              Valutazione sintetica (facoltativa, indicativa)
            </legend>
            {ASSESS_FIELDS.map((f) => (
              <select
                key={f.name}
                name={f.name}
                defaultValue={item[f.name] ?? ""}
                aria-label={f.label}
                className={selectClass}
              >
                <option value="">{f.label}: —</option>
                {Object.entries(f.scale).map(([value, s]) => (
                  <option key={value} value={value}>
                    {f.label}: {s.label}
                  </option>
                ))}
              </select>
            ))}
          </fieldset>
          <div className="flex justify-end">
            <SubmitButton size="sm" pendingText="Salvataggio…">
              Aggiorna proposta
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
