"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { votaAction, type VotoState } from "@/app/actions/valutazioni";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { PromemoriaOptin } from "@/components/valutazioni/promemoria-optin";
import { cn } from "@/lib/utils";

/*
  L'unico componente client delle Valutazioni: tutto il resto della funzione
  sono Server Component. Il confine è qui perché le stelle hanno bisogno di
  stato (anteprima al passaggio, scelta corrente) — e di niente altro.

  Ogni prop è serializzabile (stringhe e oggetti piatti): è la trappola di
  `AGENTS.md` §3 (ondata 7, 1) — una prop-funzione passata da un Server
  Component fallirebbe a RUNTIME con typecheck verde. La domanda arriva già
  composta, i quartieri già ridotti a `{id, nome}`.

  Le stelle sono radio NATIVI in un fieldset: la tastiera funziona da sola
  (frecce fra i valori), il form si invia anche senza JavaScript, e lo stato
  React serve solo alla resa visiva. Con `prefers-reduced-motion` non c'è
  niente da spegnere: nessuna animazione, solo cambi di colore.
*/

const ETICHETTE: Record<number, string> = {
  1: "pessimo",
  2: "scarso",
  3: "così così",
  4: "buono",
  5: "ottimo",
};

export function ModuloVoto({
  servizioId,
  domanda,
  famiglia,
  quartieri,
  defaultEmail,
  defaultNome,
  qrCodice,
}: {
  servizioId: string;
  /** La domanda della famiglia («Com'è andata?»), mai composta qui dentro. */
  domanda: string;
  famiglia: "sportello" | "condizione";
  /** Solo condizioni: la zona, facoltativa per chi vota. */
  quartieri?: { id: string; nome: string }[];
  defaultEmail?: string;
  defaultNome?: string;
  /** Presente su `/v/[codice]`: l'azione ricava canale e luogo dal codice. */
  qrCodice?: string;
}) {
  const [state, action] = useActionState<VotoState, FormData>(
    votaAction,
    undefined,
  );
  const [scelte, setScelte] = useState(0);
  const [anteprima, setAnteprima] = useState(0);
  const attive = anteprima || scelte;

  if (state?.ok) {
    return (
      <div role="status" className="space-y-2">
        <p className="text-base font-semibold">Il tuo voto è nel conteggio.</p>
        <p className="text-sm leading-relaxed text-muted">
          Ti abbiamo scritto all&apos;indirizzo indicato: dal link puoi
          confermare che sei tu, oppure rimuovere il voto se non lo riconosci.
          {famiglia === "condizione"
            ? " Il voto vale per questo mese: il prossimo potrai rinnovarlo."
            : ""}
        </p>
        {/* R-5, B3: il promemoria si CHIEDE, dopo il voto — solo condizioni,
            che sono le uniche a rinnovarsi. */}
        {famiglia === "condizione" && state.valutazioneId ? (
          <PromemoriaOptin valutazioneId={state.valutazioneId} />
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <input type="hidden" name="servizioId" value={servizioId} />
      {qrCodice ? <input type="hidden" name="qrCodice" value={qrCodice} /> : null}

      <fieldset>
        <legend className="text-sm font-medium text-foreground">{domanda}</legend>
        <div
          className="mt-1.5 flex items-center gap-0.5"
          onMouseLeave={() => setAnteprima(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              onMouseEnter={() => setAnteprima(n)}
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--ring)]"
            >
              <input
                type="radio"
                name="stelle"
                value={n}
                required
                className="sr-only"
                onChange={() => setScelte(n)}
              />
              <Star
                size={30}
                aria-hidden
                className={cn(
                  "transition-colors",
                  attive >= n
                    ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                    : "text-border-strong",
                )}
              />
              <span className="sr-only">
                {n === 1 ? "1 stella" : `${n} stelle`} — {ETICHETTE[n]}
              </span>
            </label>
          ))}
          {/* La parola accanto alle stelle: lo stato non è mai solo colore. */}
          <span className="ml-2 text-sm text-muted" aria-hidden>
            {attive > 0 ? ETICHETTE[attive] : ""}
          </span>
        </div>
      </fieldset>

      <Field
        label={
          famiglia === "sportello"
            ? "Racconta com'è andata (facoltativo)"
            : "Vuoi aggiungere due righe? (facoltativo)"
        }
        htmlFor="voto-testo"
      >
        <textarea
          id="voto-testo"
          name="testo"
          rows={3}
          maxLength={800}
          className="w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-2 transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]"
        />
      </Field>

      <Field label="La tua email" htmlFor="voto-email">
        <Input
          id="voto-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder="nome@esempio.it"
        />
        <p className="text-xs leading-relaxed text-muted-2">
          Serve a confermare o rimuovere il voto: ti scriviamo una volta sola e
          non compare in pagina.
        </p>
      </Field>

      {/* Due colonne solo quando i campi sono davvero due (condizione con
          tendina della zona): un campo solo in mezza colonna spezza l'etichetta. */}
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          famiglia === "condizione" && quartieri && quartieri.length > 0
            ? "sm:grid-cols-2"
            : "",
        )}
      >
        <Field label="Come vuoi comparire (facoltativo)" htmlFor="voto-nome">
          <Input
            id="voto-nome"
            name="nomeVisualizzato"
            defaultValue={defaultNome}
            maxLength={80}
            placeholder="Nome e cognome"
          />
        </Field>
        {famiglia === "condizione" && quartieri && quartieri.length > 0 ? (
          <Field label="La tua zona (facoltativa)" htmlFor="voto-quartiere">
            <select
              id="voto-quartiere"
              name="quartiereId"
              defaultValue=""
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-foreground transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]"
            >
              <option value="">Tutta la città</option>
              {quartieri.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.nome}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>

      {/*
        «Marco B.» è il default per TUTTI, account verificati compresi: il nome
        intero è un atto deliberato, non una conseguenza dell'accesso.
      */}
      <label className="flex items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="mostraNomeIntero"
          className="mt-0.5 size-4 accent-[var(--color-accent)]"
        />
        <span>
          Mostra il mio nome per intero. Senza spunta compare l&apos;iniziale del
          cognome («Marco B.»); senza nome, «Anonimo».
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xs text-xs leading-relaxed text-muted-2">
          L&apos;email resta associata al voto finché è pubblicato;
          l&apos;indirizzo IP si conserva 180 giorni contro gli abusi.{" "}
          <a
            href="/privacy"
            className="underline decoration-dotted underline-offset-2 hover:no-underline"
          >
            Informativa
          </a>
        </p>
        <SubmitButton pendingText="Invio…">Invia il voto</SubmitButton>
      </div>
    </form>
  );
}
