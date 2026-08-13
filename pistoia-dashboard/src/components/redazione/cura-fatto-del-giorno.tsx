"use client";

import { useActionState, useState } from "react";
import {
  curaFattoDelGiornoAction,
  togliCuraAction,
  type CuraState,
} from "@/app/actions/prima-pagina";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Field, Input } from "@/components/ui/input";
import { ETICHETTA_TIPO } from "@/lib/atti";
import { SOMMARIO_MAX, TITOLO_MAX } from "@/lib/prima-pagina";
import type { AttoDaCurare } from "@/lib/data/atti";

/*
  LA SUPERFICIE CON CUI SI CURA IL FATTO DEL GIORNO.

  Sta su `/redazione` e non in area Comune, e la ragione è la stessa che ha
  fatto nascere questa rotta (R-4): `/admin` è «Riservato al Comune», e la
  prima pagina di una piattaforma che **osserva** il Comune non la può scrivere
  il Comune.

  È uno STRUMENTO, non una coda (`DESIGN.md` §6): sei tu che decidi di usarlo,
  quindi **niente contatore** e niente pallino. Una coda dice «c'è del lavoro
  che si accumula»; qui il lavoro non arriva da nessuna parte — e un pallino su
  uno strumento è la ragione per cui `/admin` non sapeva dire se ci fosse
  qualcosa da fare.

  ⚠️ **Un solo modulo, non uno per atto.** La prima stesura metteva un `details`
  con dentro una form su ogni riga: con 31 atti in un giorno — il massimo
  misurato in trenta giorni è 40 — sarebbero trentuno moduli sulla stessa
  pagina, che i cancelli aprono tutti (`posata()` apre i `details` prima di
  misurare). Qui la scelta è un gruppo di radio, il modulo è uno solo, e
  **nessun atto resta fuori**: troncare la lista renderebbe non curabile
  l'atto notevole che cadesse oltre la soglia.
*/

export function CuraFattoDelGiorno({
  atti,
  curato,
}: {
  atti: AttoDaCurare[];
  curato: AttoDaCurare | null;
}) {
  const [stato, cura] = useActionState<CuraState, FormData>(
    curaFattoDelGiornoAction,
    undefined,
  );
  const [statoTogli, togli] = useActionState<CuraState, FormData>(
    togliCuraAction,
    undefined,
  );
  const [selezionato, setSelezionato] = useState(curato?.id ?? "");

  const attoSelezionato = atti.find((a) => a.id === selezionato) ?? null;

  return (
    <div className="space-y-5">
      {/* CHE COSA APRE LA HOME ADESSO — la prima cosa da sapere entrando. */}
      <div className="rounded-[var(--radius-sm)] bg-surface-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          In prima pagina adesso
        </p>
        {curato ? (
          <>
            <p className="mt-1.5 text-sm font-semibold">
              {curato.titoloRedazionale}
            </p>
            <form action={togli} className="mt-3">
              <input type="hidden" name="attoId" value={curato.id} />
              {statoTogli?.error ? <Alert>{statoTogli.error}</Alert> : null}
              <SubmitButton
                variant="secondary"
                size="sm"
                pendingText="Rimozione…"
              >
                Togli la cura
              </SubmitButton>
            </form>
          </>
        ) : (
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Nessun fatto del giorno. La home apre col fiume degli atti e col
            numero-monumento, <strong>senza fingere un&apos;apertura</strong>: è
            la regola, non un ripiego. Se oggi non c&apos;è niente da spiegare,
            lasciarla così è la scelta giusta.
          </p>
        )}
      </div>

      <form action={cura} className="space-y-4">
        {stato?.error ? <Alert>{stato.error}</Alert> : null}
        {stato?.ok ? (
          <p role="status" className="text-sm text-muted">
            Fatto del giorno aggiornato: la prima pagina apre con questo atto.
          </p>
        ) : null}

        {/*
          ⚠️ `min-w-0` sul `fieldset`, e non è decorazione: il foglio di stile
          del BROWSER gli mette `min-inline-size: min-content`, quindi un
          fieldset **non si stringe** sotto la larghezza del proprio contenuto
          più lungo. Misurato a 360px in modalità semplice: **520px dentro un
          genitore da 275**, cioè 203px di pagina che scorre di lato — e l'ha
          trovato `shots --simple --width=360`, non l'occhio.

          È la famiglia di `AGENTS.md` §3 (ondata 7, 5): lì il pavimento era il
          min-content di una traccia di griglia, qui è quello di un elemento che
          se lo porta dalla nascita. Nessun `min-w-0` sui figli lo risolve: il
          pavimento sta QUI.
        */}
        <fieldset className="min-w-0">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            L&apos;atto ({atti.length} pubblicati quel giorno)
          </legend>
          <ul className="mt-2 divide-y divide-border">
            {atti.map((a) => (
              <li key={a.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 py-3">
                  <input
                    type="radio"
                    name="attoId"
                    value={a.id}
                    checked={selezionato === a.id}
                    onChange={() => setSelezionato(a.id)}
                    className="mt-1 size-4 shrink-0 accent-[var(--teal)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-2">
                        {ETICHETTA_TIPO[a.tipo]}
                        {a.numero > 0 ? ` n. ${a.numero}` : ""}
                      </span>
                      {a.titoloRedazionale ? (
                        <span className="rounded-pill bg-viola-soft px-2 py-0.5 text-[11px] font-semibold text-viola">
                          curato
                        </span>
                      ) : null}
                    </span>
                    {/*
                      L'oggetto si apre per intero SOLO sulla riga scelta: è
                      lungo in mediana 245 caratteri (p90 428), quindi trentuno
                      oggetti interi sarebbero un muro — ma scrivere un titolo
                      senza aver letto l'atto per intero è esattamente ciò che
                      questo campo esiste per impedire.
                    */}
                    {/* ⚠️ Niente `block` accanto a `line-clamp-2`: sono due
                        utility che dichiarano entrambe `display`, e a vincere
                        è quella che il foglio generato scrive per ultima — non
                        l'ordine in cui stanno scritte qui. Con `block` il
                        troncamento semplicemente non avveniva, e gli oggetti
                        uscivano interi tutti e trentuno. */}
                    {/* `break-words`: l'oggetto ufficiale porta codici di
                        protocollo senza spazi — CUP, CIG, partite IVA — e in
                        una colonna da 275px una parola non spezzabile sporge
                        dal proprio contenitore e finisce nello `scrollWidth`
                        (`AGENTS.md` §3, ondata 7, 5, corollario). Su un testo
                        macchina spezzare è la scelta giusta: non si sta
                        rompendo una parola, si sta mandando a capo un codice. */}
                    <span
                      className={
                        selezionato === a.id
                          ? "mt-1 block break-words text-sm leading-snug"
                          : "mt-1 line-clamp-2 break-words text-sm leading-snug text-muted"
                      }
                    >
                      {a.oggetto}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-2">
                      {a.ufficio}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        {/*
          `key` sull'atto scelto: cambiando riga i due campi si rimontano e i
          `defaultValue` si riapplicano. Senza, scegliendo un atto già curato i
          campi resterebbero quelli di prima — cioè si riscriverebbe da zero un
          titolo che esiste già.
        */}
        <div key={selezionato} className="space-y-3">
          <Field
            label={`Titolo umano (max ${TITOLO_MAX} caratteri)`}
            htmlFor="cura-titolo"
          >
            <Input
              id="cura-titolo"
              name="titolo"
              required
              maxLength={TITOLO_MAX}
              defaultValue={attoSelezionato?.titoloRedazionale ?? ""}
              placeholder="Che cosa cambia, in una frase piana"
            />
          </Field>

          <Field
            label={`Didascalia della redazione (facoltativa, max ${SOMMARIO_MAX})`}
            htmlFor="cura-sommario"
          >
            <textarea
              id="cura-sommario"
              name="sommario"
              rows={3}
              maxLength={SOMMARIO_MAX}
              defaultValue={attoSelezionato?.sommarioRedazionale ?? ""}
              placeholder="Perché questo atto conta. Una o due frasi, non un articolo."
              className="w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-2 transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]"
            />
          </Field>
        </div>

        {/*
          LE TRE RIGHE DI GUIDA — il «registro Il Post» (P18).

          Non sono cortesia: chi apre questa pagina vede una casella vuota, e
          una casella vuota su una prima pagina scivola nel titolo da giornale
          locale. `montaggio-d1-d2.md` §5.4 lo dichiara come cosa mancante; qui
          è colmata. Il registro è quello di `DESIGN.md` §1: spiegare senza
          gridare, domandare senza accusare.
        */}
        <ul className="space-y-1 border-l-2 border-border pl-3.5 text-xs leading-relaxed text-muted-2">
          <li>
            Spiega, non gridare: il titolo dice <em>che cosa cambia</em> per chi
            legge, non quanto è grave.
          </li>
          <li>
            Niente punti esclamativi e nessun giudizio: numeri caldi, tono
            freddo.
          </li>
          <li>
            Se il titolo non si capisce senza leggere l&apos;atto, non è ancora
            un titolo.
          </li>
        </ul>

        <SubmitButton pendingText="Salvataggio…" disabled={!selezionato}>
          Metti in prima pagina
        </SubmitButton>
      </form>
    </div>
  );
}
