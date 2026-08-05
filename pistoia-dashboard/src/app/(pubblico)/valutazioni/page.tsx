import type { Metadata } from "next";
import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import {
  getPanoramica,
  type ColonnaDura,
  type SchedaServizio,
} from "@/lib/data/valutazioni";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StarRating } from "@/components/ui/star-rating";
import { TimbroMetodologia } from "@/components/valutazioni/timbro-metodologia";
import { formatNumber } from "@/lib/format";
import { TITOLO_FAMIGLIA } from "@/lib/valutazioni";

export const metadata: Metadata = {
  title: "Valutazioni dei servizi",
  description:
    "Come i cittadini di Pistoia valutano i servizi allo sportello e le condizioni della città, accanto a ciò che le segnalazioni già dicono.",
};

/*
  «Valutazioni dei servizi» — la quinta funzione dell'osservatorio civico
  (`ROADMAP.md` §6), disegnata con Lorenzo il 2026-08-03. Piano completo e le
  dodici decisioni che lo governano: `docs/piano-rating-servizi.md`.

  **Due tabelloni che non si fondono mai in una classifica sola.** È la regola
  che regge la pagina: uno è una media di *episodi* (una pratica, una data, un
  ufficio), l'altro un *umore* su uno stato continuo. Metterli in una
  graduatoria unica — «Anagrafe 4,1» sopra «Sicurezza 2,1» — affermerebbe che
  sono confrontabili, e non lo sono. Da qui anche la rinuncia al nome di
  lavorazione «Pistoia Index»: un nome che promette un indice costringe prima o
  poi qualcuno a calcolarlo, e sarebbe la prima cosa citata fuori contesto.

  **Nessuna cifra display**, e per la ragione opposta a quella che ci si
  aspetta: le candidate ci sarebbero, ma nessuna regge. La media di un servizio
  a 88px punterebbe *un* servizio, cioè sceglierebbe una notizia; il numero di
  valutazioni raccolte misura la piattaforma, non la città; e la media delle
  medie è la fusione dei due tabelloni per via aritmetica, cioè esattamente
  ciò che la pagina si rifiuta di fare. Apre invece sui due tabelloni, che sono
  ciò che l'insieme dice davvero.

  **La pagina deve reggere a zero valutazioni**, perché è così che la vede
  chiunque il primo giorno. Il seed semina un mese dimostrativo DICHIARATO
  (decisione 2026-08-04, piano §8.7) — ma Trasporti e tre sportelli restano a
  zero di proposito: l'assenza vera è parte di ciò che la pagina deve saper
  dire, e le E2E la provano lì.
*/
export default async function ValutazioniPage() {
  // Nessun requireUser (R-5, decisione W1 del 2026-08-04): la panoramica è a
  // lettura pubblica — il regime d'accesso lo dichiara il gruppo (pubblico).
  const p = await getPanoramica();

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Cosa ne pensa la città"
        title="Valutazioni dei servizi"
        description="Le stelle le mettono i cittadini. Il numero accanto lo dicono le segnalazioni, e c'era già."
        icon={<Star size={22} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Tabellone famiglia="sportello" schede={p.sportello} />
        <Tabellone famiglia="condizione" schede={p.condizione} />
      </div>

      {/*
        La riga che impedisce la lettura sbagliata più probabile. Sta in fondo e
        non in cima perché in cima sarebbe una scusa preventiva; qui è la
        didascalia di ciò che il lettore ha appena visto.
      */}
      <Card className="bg-surface-2/40">
        <p className="text-sm leading-relaxed text-muted">
          I due tabelloni non si sommano e non si mettono in classifica fra
          loro: a sinistra c&apos;è la media di <strong className="text-foreground">esperienze</strong>{" "}
          — una pratica, una data, un ufficio — a destra un{" "}
          <strong className="text-foreground">umore</strong> su come si vive la
          città. Sono due misure diverse, e un unico voto della città non
          esiste.
        </p>
        <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted">
          Le medie compaiono <strong className="text-foreground">dal primo
          voto</strong>, sempre col numero di valutazioni che le compone. Quel
          numero sta accanto perché serve a pesare: chi lascia una recensione
          tende a farlo quando è molto scontento o molto contento, e su pochi
          voti quella tendenza pesa — una media da tre voti dice meno di una da
          trenta, e la pagina non lo nasconde.
        </p>
      </Card>

      {/* Il colophon (B2): la stessa riga della scheda e del digest. */}
      <TimbroMetodologia />
    </div>
  );
}

function Tabellone({
  famiglia,
  schede,
}: {
  famiglia: "sportello" | "condizione";
  schede: SchedaServizio[];
}) {
  const t = TITOLO_FAMIGLIA[famiglia];
  return (
    <Card className="flex flex-col">
      <h2 className="text-base font-semibold">{t.titolo}</h2>
      <p className="mt-0.5 text-sm text-muted">{t.sottotitolo}</p>

      <ul className="mt-3">
        {schede.map((s) => (
          <RigaServizio key={s.servizio.id} scheda={s} />
        ))}
      </ul>
    </Card>
  );
}

/**
 * La riga sintetica della colonna dura.
 *
 * Costruita a pezzi invece che con un template a incastro, perché il template
 * si rompeva: su `sicurezza`, dove il volume non si accosta, e senza mediana,
 * produceva la frase «Intanto dalle segnalazioni: chiuse». Vista dal vivo il
 * 2026-08-03 — nessun errore, solo una pagina che diceva una parola sola.
 */
function sintesiColonna(c: ColonnaDura): string {
  const pezzi: string[] = [];
  // Senza ripetere «segnalazioni», che è già nell'etichetta della riga.
  if (c.volumeAccostabile && c.segnalazioni > 0) {
    pezzi.push(`${formatNumber(c.segnalazioni)} quest'anno`);
  }
  if (c.giorniMediani != null) {
    pezzi.push(
      `chiuse in ${formatNumber(c.giorniMediani)} ${c.giorniMediani === 1 ? "giorno" : "giorni"}`,
    );
  }
  return pezzi.join(", ");
}

/*
  `min-w-0` sull'elemento e sulla colonna del testo: la traccia si stringe, ma
  l'elemento si ferma al proprio min-content, e qui il min-content è un nome
  lungo e inscindibile come «Sportello unico edilizia» (AGENTS.md §3, ondata
  7/5 e il suo corollario del 2026-07-29).
*/
function RigaServizio({ scheda }: { scheda: SchedaServizio }) {
  const { servizio: s, media: m, composizione: c, colonna } = scheda;

  return (
    <li className="min-w-0 border-t border-border first:border-t-0">
      <Link
        href={`/valutazioni/${s.id}`}
        className="-mx-2 flex items-center gap-3 rounded-inner px-2 py-3 transition-colors hover:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{s.nome}</span>

          {m.valore != null ? (
            <span className="mt-1 block text-xs text-muted-2">
              {formatNumber(c.totale)}{" "}
              {c.totale === 1 ? "valutazione" : "valutazioni"} ·{" "}
              {formatNumber(c.confermate)} da email confermata
            </span>
          ) : (
            <span className="mt-1 block text-xs text-muted-2">
              Nessuna valutazione ancora
            </span>
          )}

          {/*
            La colonna dura, che c'è dal primo giorno. Compare SOLO quando il
            voto non c'è ancora: quando la media esiste, il confronto è il
            contenuto della scheda di dettaglio e qui sarebbe una terza riga
            che nessuno legge.
          */}
          {m.valore == null && colonna?.haQualcosaDaDire ? (
            <span className="mt-1 block text-xs text-muted">
              Intanto dalle segnalazioni:{" "}
              <span className="text-foreground">{sintesiColonna(colonna)}</span>
            </span>
          ) : null}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {m.valore != null ? (
            <StarRating value={m.valore} size={13} showValue />
          ) : (
            <span className="text-xs text-muted-2">in attesa</span>
          )}
          <ChevronRight size={15} className="text-muted-2" aria-hidden />
        </span>
      </Link>
    </li>
  );
}
