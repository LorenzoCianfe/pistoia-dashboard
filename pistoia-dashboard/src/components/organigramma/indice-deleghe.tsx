"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

/**
 * Una voce dell'indice, ridotta a ciò che serve a schermo.
 *
 * Il tipo è **piatto e di sole stringhe** di proposito: attraversa il confine
 * server → client, e una prop non serializzabile là in mezzo sparisce a
 * runtime senza che typecheck o lint dicano niente (`AGENTS.md` §3, ondata 7,
 * trappola 1).
 */
export type VoceDelega = {
  delega: string;
  nome: string;
  ancora: string;
};

/**
 * L'indice delle deleghe, con un filtro sopra (decisione di Lorenzo,
 * 2026-08-06).
 *
 * Perché un filtro e non un taglio, un raggruppamento o una fisarmonica:
 * **l'indice esiste per far trovare UNA materia fra 57**, e scorrere 57 righe
 * è il modo più lento di cercarne una. Il filtro fa il mestiere che l'indice
 * promette senza togliere né riordinare niente — **chi non scrive nulla vede
 * esattamente la pagina di prima**, e chi non ha JavaScript pure.
 *
 * Tre dettagli che non sono di comodo:
 *
 * - il campo cerca **anche fra i nomi**, perché «di cosa si occupa Nesti» è la
 *   stessa domanda letta dall'altro capo, e chi la fa non deve scoprire che
 *   quel verso non è previsto;
 * - il conteggio sta in una **live region**: senza, chi usa uno screen reader
 *   scrive e non sa che è successo qualcosa — la lista si accorcia in
 *   silenzio;
 * - il campo è alto **44px** (`DESIGN.md` §11.6). Qui la regola si applica per
 *   intero senza discussione: è un bersaglio isolato e tattile, non un link
 *   dentro la prosa.
 */
export function IndiceDeleghe({ voci }: { voci: VoceDelega[] }) {
  const [q, setQ] = useState("");

  const filtrate = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return voci;
    return voci.filter(
      (v) =>
        v.delega.toLowerCase().includes(t) || v.nome.toLowerCase().includes(t),
    );
  }, [q, voci]);

  return (
    <>
      <div className="mt-3 flex h-11 items-center gap-2 rounded-pill border border-border-strong bg-surface px-4">
        <Search size={15} className="shrink-0 text-muted-2" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca una materia o un nome…"
          aria-label="Cerca fra le deleghe della giunta"
          /* `min-w-0` accanto a `flex-1`: un `<input>` ha una larghezza
             intrinseca e in flex `min-width: auto` gli fa da pavimento
             (AGENTS.md §3, trappola 23). */
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-2"
        />
      </div>

      {/*
        L'esito si ANNUNCIA. `aria-live="polite"` perché il numero cambia a ogni
        tasto: una live region assertiva interromperebbe la lettura a ogni
        lettera. Quando il campo è vuoto la riga tace, perché non è successo
        niente da raccontare.
      */}
      <p aria-live="polite" className="sr-only">
        {q.trim()
          ? `${filtrate.length} deleghe su ${voci.length} corrispondono a ${q.trim()}`
          : ""}
      </p>

      {filtrate.length > 0 ? (
        /*
          `grid-cols-1` accanto alle varianti con prefisso, e `min-w-0`
          sull'elemento: sotto la soglia `sm` la traccia implicita è `auto`, il
          cui minimo è il min-content, e l'elemento di griglia si ferma al
          proprio min-content anche quando la traccia è `minmax(0, 1fr)`. Qui il
          min-content è una delega lunga e inscindibile come «Attività
          produttive, vivaismo e sviluppo economico sostenibile» (AGENTS.md §3,
          ondata 7/5 e il suo corollario del 2026-07-29).
        */
        <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtrate.map((v) => (
            <li key={`${v.ancora}-${v.delega}`} className="min-w-0">
              <a
                href={`#assessore-${v.ancora}`}
                className="-mx-2 block rounded-inner px-2 py-1.5 transition-colors hover:bg-surface-2"
              >
                <span className="block text-sm leading-snug">{v.delega}</span>
                <span className="block text-xs text-muted-2">{v.nome}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        /* Uno stato vuoto disegnato, non un `<p>Nessun risultato</p>`
           (DESIGN.md §12): dice anche come uscirne. */
        <p className="mt-4 rounded-[var(--radius-sm)] border border-dashed border-border-strong px-4 py-5 text-center text-sm text-muted">
          Nessuna delega contiene «{q.trim()}».
          <br />
          <span className="text-xs text-muted-2">
            Le materie sono quelle che il Comune elenca: prova una parola più
            corta, o svuota il campo per vederle tutte.
          </span>
        </p>
      )}
    </>
  );
}
