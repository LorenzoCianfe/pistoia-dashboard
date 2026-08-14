import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DisplayNumber } from "@/components/signature/display-number";
import { costoAnnuoGiunta, INDENNITA_SINDACO } from "@/lib/costo-amministrazione";
import { righeMonumento } from "@/lib/prima-pagina";
import { formatNumber } from "@/lib/format";

/**
 * IL NUMERO-MONUMENTO — l'isola scura della prima pagina (P4).
 *
 * Il dato caldo, grande e curato che la direzione chiede in cima (§1.6.4): il
 * costo della giunta, che è già un dato vero in casa e la cui catena di legge
 * sta tutta in `lib/costo-amministrazione.ts`, fonte per fonte.
 *
 * 🔴 **È un fatto, non un'accusa.** «Numeri caldi, tono freddo»
 * (`direzione-prodotto.md` §1.7): niente rosso d'allarme, nessuna freccia,
 * nessun punto esclamativo, e la riga che dice **chi decide quegli importi** —
 * la legge, non il Comune — sta nella stessa card e non in una nota a piè di
 * pagina. Lo stesso numero con un colore d'urgenza sarebbe un giudizio, e un
 * intermediario civico che scivola nel tabloid perde il capitale che lo tiene
 * in piedi.
 *
 * 🔴 **I partiti non ci sono, ed è misurato** — la ragione sta per esteso in
 * `lib/prima-pagina.ts` e in `docs/fonti-organigramma.md` §2.2. Al loro posto
 * c'è **come si arriva alla carica**, che è vero per tutte e nove le persone.
 */
export function Monumento() {
  const righe = righeMonumento();
  const annuo = costoAnnuoGiunta();
  const quante = righe.reduce((n, r) => n + r.quante, 0);

  return (
    <section
      aria-labelledby="monumento-titolo"
      className="isola flex flex-col p-5 sm:p-7"
    >
      <h2 id="monumento-titolo" className="sr-only">
        Il costo della giunta
      </h2>

      {/* La cifra display: **una sola per schermata** (`DESIGN.md` §8), ed è
          questa. Peso 300 contro label 11px in 600 — la gerarchia la fa la
          scala, e il peso va nella direzione opposta a quella istintiva: è
          ciò che le dà il tono di un dato invece che di uno slogan. */}
      <DisplayNumber
        value={annuo}
        unit="€ all'anno"
        label="Costo della giunta"
        annuncio="Costo della giunta"
      />

      <ul className="mt-6 space-y-3 border-t border-[var(--isola-border)] pt-5">
        {righe.map((r, i) => (
          <li key={r.chi}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 text-sm font-semibold">
                {r.chi}
                {/* «come si arriva alla carica», al posto del partito. */}
                <span className="ml-2 text-xs font-normal text-[var(--isola-muted)]">
                  {r.carica.split(",")[0]} · {r.accesso}
                </span>
              </p>
              <p className="shrink-0 font-mono text-[12.5px] tabular-nums text-[var(--isola-muted)]">
                {formatNumber(r.importoMensile)} €
                <span className="sr-only"> al mese a testa</span>
                <span aria-hidden>/mese</span>
              </p>
            </div>
            {/*
              La barra è proporzionale all'indennità del SINDACO, che è la base
              di legge da cui le altre due si calcolano (75% e 60%): una scala
              inventata sarebbe peggio di nessuna scala (`DESIGN.md` §8).

              `role="presentation"`: l'informazione è già nel numero accanto, e
              una barra che si riannuncia sarebbe rumore per chi ascolta.

              🔴 **Si DISEGNA, e dopo la cifra** (2026-08-14). Le tre barre
              *sono* il rapporto 100/75/60 fissato dalla legge: disegnarle in
              sequenza fa **leggere** il rapporto invece di mostrarlo già
              risolto. Il ritardo le fa partire quando la cifra ha finito di
              contare, così i due movimenti non si accavallano.

              ⚠️ L'animazione è CSS con `both` e un ritardo fisso, non legata a
              `useInView`: un'animazione che dipende da uno stato può **restare
              a zero** se quello stato non arriva mai, e una barra ferma a zero
              non è un'animazione mancata — è un dato sbagliato. Così finisce
              sempre, e con `prefers-reduced-motion` la regola globale azzera la
              durata e le barre sono semplicemente già piene.
            */}
            <div
              role="presentation"
              className="mt-1.5 h-1 overflow-hidden rounded-pill bg-[var(--isola-border)]"
            >
              <div
                className="barra-disegna h-full rounded-pill bg-[var(--isola-muted)]"
                style={
                  {
                    "--larghezza": `${Math.round((r.importoMensile / INDENNITA_SINDACO) * 100)}%`,
                    "--ritardo": `${1000 + i * 90}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-[var(--isola-muted)]">
        {quante} persone. Gli importi sono fissati dalla legge per fascia di
        popolazione: non li decide il Comune. Quattro assessori su otto non
        erano candidati alle elezioni — li nomina il sindaco.
      </p>

      <Link
        href="/trasparenza/costo-amministrazione"
        className="group inline-flex min-h-11 items-center gap-1.5 self-start pt-3 text-sm font-semibold text-[var(--isola-ink)] underline decoration-dotted underline-offset-4 hover:no-underline"
      >
        La catena di legge, fonte per fonte
        <ArrowRight
          size={15}
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </Link>
    </section>
  );
}
