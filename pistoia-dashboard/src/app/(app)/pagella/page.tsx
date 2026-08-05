import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  MessagesSquare,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { ChiPubblica } from "@/components/osservatorio/chi-pubblica";
import { TimbroMetodologia } from "@/components/valutazioni/timbro-metodologia";
import { getPanoramica } from "@/lib/data/valutazioni";
import type { SchedaServizio } from "@/lib/data/valutazioni";
import {
  REGOLE,
  REGOLE_PAGELLA,
  VERSIONE_METODOLOGIA,
} from "@/lib/metodologia";
import {
  MATERIE_PAGELLA,
  SCADENZA_ART14,
  VOTO_MAX,
  VOTO_MIN,
  controlliDi,
  dataItaliana,
  type MateriaPagella,
} from "@/lib/pagella";

export const metadata: Metadata = {
  title: "La pagella della giunta",
  description:
    "La pagella dell'osservatorio civico: sei materie a due regimi, un voto ricontabile solo dove il traguardo è fissato per legge, la metodologia che lo produce e la dichiarazione di chi pubblica.",
};

/*
  La prima pagina di giudizio, nella forma composta da Lorenzo il 2026-08-05
  (piano-pagella.md §1): sei materie a due regimi — il voto 1–10 solo dove
  una norma fissa il traguardo, i fatti dove non lo fissa nessuno, l'assenza
  spiegata dove oggi manca una fonte reale.

  NESSUN VOTO È CALCOLATO, e il posto del voto dice perché: la prima edizione
  non può esistere prima del termine dell'art. 14 (SCADENZA_ART14) — prima di
  quella data un'assenza sul portale è ancora dentro la legge, e giudicarla
  sarebbe un'accusa tratta da un dato mancante. La prima ricognizione reale
  (P-3) porterà l'edizione «2026-T3», già timbrata con la versione della
  metodologia; questa pagina verrà estesa allora, non prima. Il seed non
  semina pagelle, mai.

  Il riquadro «La voce dei cittadini» è la forma R1: le stelle accostate come
  contesto, col campione, MAI dentro un voto (metodologia, regola 20).
*/

const ICONE: Record<string, typeof ShieldCheck> = {
  trasparenza: ScrollText,
  spesa: Wallet,
  promesse: Target,
  sicurezza: ShieldCheck,
  decoro: Sparkles,
  ascolto: MessagesSquare,
};

/** L'ordine di lettura della griglia: prima chi avrà un voto, poi il resto. */
const SPAN: Record<string, string> = {
  trasparenza: "sm:col-span-6",
  spesa: "sm:col-span-3",
  promesse: "sm:col-span-3",
  sicurezza: "sm:col-span-2",
  decoro: "sm:col-span-2",
  ascolto: "sm:col-span-2",
};

export default async function PagellaPage() {
  const panoramica = await getPanoramica();

  return (
    <div className="space-y-6 page-enter">
      {/* Primo elemento: il filo è `sticky` e va agganciato sotto la barra in
          alto, non più in basso. */}
      <ChiPubblica />

      <SectionHeader
        eyebrow="Osservatorio civico"
        title="La pagella della giunta"
        description="Sei materie, giudicate al livello della giunta e mai su una singola persona. Il voto compare solo dove un traguardo fissato per legge permette di contarlo; altrove la materia porta i fatti — o dichiara che cosa le manca."
      />

      <Card className="bg-surface-2/40">
        <CardEyebrow>
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock size={13} aria-hidden />
            Prima edizione
          </span>
        </CardEyebrow>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          <strong className="text-foreground">
            Dopo il {dataItaliana(SCADENZA_ART14)}
          </strong>{" "}
          — il termine che l&apos;art. 14 del D.Lgs 33/2013 dà al Comune per
          pubblicare i dati della giunta in carica. Prima di quella data
          un&apos;assenza sul portale è ancora dentro i termini di legge, e
          giudicarla sarebbe un&apos;accusa tratta da un dato mancante. Da lì
          in poi: un&apos;edizione a trimestre, ogni cifra con il link
          all&apos;atto e la data di consultazione, ogni edizione timbrata con
          la versione della metodologia che l&apos;ha calcolata.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        {MATERIE_PAGELLA.map((m) => (
          <Materia key={m.id} materia={m} />
        ))}
      </div>

      <Card className="border-border-strong">
        <CardEyebrow>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-viola" aria-hidden />
            Diritto di replica
          </span>
        </CardEyebrow>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          Ogni edizione ospiterà la replica della giunta allo stesso corpo del
          giudizio. Oggi nessuna edizione esiste e{" "}
          <strong className="text-foreground">
            nessuna replica è stata richiesta
          </strong>
          : quando lo sarà, qui resteranno scritte la data della richiesta e
          l&apos;eventuale silenzio — un silenzio dichiarato è
          un&apos;informazione, uno nascosto sembra assenso.
        </p>
      </Card>

      <VoceDeiCittadini
        condizioni={panoramica.condizione}
        sportelli={panoramica.sportello}
        conVoto={panoramica.conVoto}
        totale={panoramica.totale}
      />

      <Card id="metodologia" className="scroll-mt-24 bg-surface-2/40">
        <h2 className="text-base font-bold tracking-tight">Come si calcola</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Le regole della pagella sono il capitolo 2 della{" "}
          <Link
            href="/metodologia"
            className="font-semibold text-teal underline-offset-2 hover:underline"
          >
            metodologia
          </Link>{" "}
          (regole {REGOLE.length + 1}–{REGOLE.length + REGOLE_PAGELLA.length},
          versione v{VERSIONE_METODOLOGIA} con registro delle modifiche),
          pubblicate <em>prima</em> che il primo voto sia calcolato. Il voto va
          da {VOTO_MIN} a {VOTO_MAX}{" "}
          ed è un conteggio che si può rifare a mano: ogni controllo ha un
          traguardo fissato da una norma, ogni
          punto perso è una riga con la sua fonte. Ogni edizione porterà il
          timbro della versione che l&apos;ha calcolata: senza, una pagella
          vecchia diventa incontestabile perché nessuno sa più con quali
          regole fu prodotta.
        </p>
      </Card>

      <Card id="fonti" className="scroll-mt-24 bg-surface-2/40">
        <h2 className="text-base font-bold tracking-tight">
          Da dove vengono i numeri
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Da <em>Amministrazione trasparente</em> del Comune di Pistoia, la cui
          pubblicazione è obbligatoria per legge (D.Lgs 33/2013), dalle
          delibere di bilancio e dalle linee programmatiche di mandato. Ogni
          affermazione è una riga con il proprio link al documento e la data in
          cui è stato consultato; il renderer rifiuta le righe senza fonte.
        </p>
      </Card>

      <TimbroMetodologia />
    </div>
  );
}

function Materia({ materia: m }: { materia: MateriaPagella }) {
  const Icona = ICONE[m.id] ?? ShieldCheck;

  return (
    <Card id={m.id} className={`min-w-0 scroll-mt-24 ${SPAN[m.id] ?? ""}`}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-teal">
          <Icona size={16} aria-hidden />
        </span>
        {m.nome}
        {m.regime === "voto" ? (
          <span className="text-xs font-medium text-muted-2">
            voto da {VOTO_MIN} a {VOTO_MAX} · si riconta
          </span>
        ) : null}
      </p>

      {m.regime === "voto" ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {m.descrizione}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-2">
            In attesa della prima edizione — i{" "}
            {controlliDi(m.id as "trasparenza" | "spesa").length} controlli che
            si conteranno:
          </p>
          <ul className="mt-2 space-y-1.5 border-t border-border pt-2">
            {controlliDi(m.id as "trasparenza" | "spesa").map((c) => (
              <li key={c.id} className="text-xs leading-relaxed text-muted">
                {c.controllo}
                <span className="ml-1.5 font-mono text-[11px] text-muted-2">
                  {c.traguardoDi}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {/* Il posto del voto resta disegnato, mai un trattino muto
              (metodologia, regola 16). */}
          <p
            className="mt-3 font-display text-[40px] font-light leading-none tracking-tight text-muted-2"
            aria-hidden
          >
            —
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {m.regime === "fatti"
              ? `Senza voto, per scelta: ${m.descrizione}`
              : `Senza voto: ${m.descrizione}`}
          </p>
          {m.regime === "fatti" ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-2">
              Gli impegni si censiscono con la prima ricognizione, ognuno con
              la propria fonte.
            </p>
          ) : null}
          {m.cosaLaAccenderebbe ? (
            <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-2">
              <span className="font-semibold uppercase tracking-[0.1em]">
                La accenderebbe
              </span>{" "}
              — {m.cosaLaAccenderebbe}
            </p>
          ) : null}
        </>
      )}
    </Card>
  );
}

/**
 * La forma R1 (2026-08-05): le stelle dei cittadini accostate come contesto,
 * col campione dichiarato — mai dentro un voto. Finché i voti sono di semina
 * la dichiarazione dei dati dimostrativi sta QUI, non solo nel badge globale:
 * questa è una pagina di giudizio su persone vere.
 */
function VoceDeiCittadini({
  condizioni,
  sportelli,
  conVoto,
  totale,
}: {
  condizioni: SchedaServizio[];
  sportelli: SchedaServizio[];
  conVoto: number;
  totale: number;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardEyebrow>La voce dei cittadini — non entra in nessun voto</CardEyebrow>
        <Badge color="amber">voti dimostrativi</Badge>
      </div>
      <RigaFamiglia etichetta="Condizioni della città" schede={condizioni} />
      <RigaFamiglia etichetta="Servizi allo sportello" schede={sportelli} />
      <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-2">
        {conVoto} caselle su {totale} hanno già voti. Le stelle sono un umore
        sui servizi, la pagella conta adempimenti della giunta: si guardano
        insieme, non si sommano.{" "}
        <Link
          href="/valutazioni"
          className="font-semibold text-teal underline-offset-2 hover:underline"
        >
          Tutte le valutazioni
        </Link>
      </p>
    </Card>
  );
}

function RigaFamiglia({
  etichetta,
  schede,
}: {
  etichetta: string;
  schede: SchedaServizio[];
}) {
  const conVoto = schede.filter((s) => s.media.valore != null);
  if (conVoto.length === 0) return null;

  return (
    <p className="mt-3 text-sm leading-relaxed">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-2">
        {etichetta}
      </span>{" "}
      <span className="text-muted">
        {conVoto.map((s, i) => (
          <span key={s.servizio.id}>
            {i > 0 ? " · " : ""}
            {s.servizio.nome}{" "}
            <strong className="font-semibold text-foreground">
              {s.media.valore!.toLocaleString("it-IT")}
            </strong>{" "}
            <span className="text-muted-2">({s.media.campione})</span>
          </span>
        ))}
      </span>
    </p>
  );
}
