"use client";

import { Lightbulb } from "lucide-react";
import { reportCategory } from "@/lib/community";
import { suggerisciCategoria } from "@/lib/moderazione-assistita";

/*
  IL SUGGERIMENTO DI CATEGORIA (Ondata 8, moderazione assistita).

  ⚠️ **Vive QUI e non sul triage del Comune**, e la ragione è una regola che
  vale oltre questo componente: **un consiglio che non si può seguire è peggio
  del silenzio.** Il modulo di triage cambia stato, ufficio e nota — mai la
  categoria, che la sceglie il cittadino e nessuna superficie del Comune
  modifica. Lì il suggerimento avrebbe mostrato una discrepanza che l'operatore
  non poteva risolvere. Qui la leva c'è: è la tendina accanto.

  **Non decide, propone, e si può ignorare senza fare niente.** La tendina
  resta su ciò che la persona ha scelto: il suggerimento è un pulsante che va
  premuto, mai un valore che si applica da sé.

  **E porta le proprie prove** — le parole che l'hanno prodotto — perché una
  proposta che si ricontrolla in un secondo non è un oracolo. È la stessa
  regola per cui il voto della pagella vale: si riconta a mano.

  Tace in tre casi su quattro in cui potrebbe sbagliare (`lib/moderazione-assistita.ts`).
*/

export function SuggerimentoCategoria({
  testo,
  categoriaScelta,
  onApplica,
}: {
  testo: string;
  categoriaScelta: string | null;
  onApplica: (categoria: string) => void;
}) {
  const s = suggerisciCategoria(testo, categoriaScelta);
  if (!s) return null;

  const nome = reportCategory(s.categoria).label;

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 py-2.5">
      <p className="flex items-start gap-2 text-sm">
        <Lightbulb size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden />
        <span>
          Dal testo sembra <strong>{nome}</strong>.{" "}
          <span className="text-xs text-muted">
            Parole trovate:{" "}
            {s.prove.map((p, i) => (
              <span key={p}>
                {i > 0 ? ", " : ""}
                <em>{p}</em>
              </span>
            ))}
            .
          </span>
        </span>
      </p>
      <button
        type="button"
        onClick={() => onApplica(s.categoria)}
        className="mt-2 inline-flex min-h-11 items-center rounded-pill border border-border-strong px-3.5 text-sm font-medium hover:bg-surface"
      >
        Usa «{nome}»
      </button>
    </div>
  );
}
