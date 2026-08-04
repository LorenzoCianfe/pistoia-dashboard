import Link from "next/link";
import { Database, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { FIRMA_REDAZIONE } from "@/lib/redazione";

/*
  La dichiarazione di chi pubblica — sostituisce il marchio separato.

  Il problema che risolve è di attribuzione, non di stile: la barra in alto
  porta lo stemma vero e la scritta «Comune di Pistoia», quindi una pagella
  sulla giunta resa sotto quella barra si legge come autocritica
  dell'amministrazione. Due tentativi di marchio indipendente sono stati
  respinti (ROADMAP.md §6, prerequisito 1): lo stemma resta, e l'equivoco si
  scioglie **dicendolo**.

  **Perché è un pezzo solo e non due componibili.** La forma approvata
  (2026-07-30) mette insieme un cartiglio e un filo persistente, e i due
  rispondono a domande diverse: il cartiglio dice *chi scrive* e *chi fornisce
  i numeri*, il filo fa durare la smentita quanto lo stemma. Esporli separati
  renderebbe possibile montarne metà — e la metà che si dimentica è sempre il
  filo, perché il difetto che copre non si vede finché non si scorre. Chi non
  può usarne metà non può sbagliarsi.

  Il viola è il marcatore della voce redazionale, e non è una scelta libera:
  è l'unico colore di sistema che DESIGN.md §4 assegna al lato cittadino
  («partecipazione e comunità»). Il teal direbbe «azione della piattaforma»,
  il rosso è lo stemma stesso più l'urgenza. Vive su filo e pallino, **mai su
  testo**: `--viola` su superficie chiara fa ~3,3:1, sotto la soglia AA che
  DESIGN.md §11 non lascia regredire.
*/

/**
 * Il soggetto che firma il giudizio. Scelto il 2026-07-30; da R-4 la stringa
 * vive in `lib/redazione.ts`, perché la stessa firma va su registro, rimozioni
 * e Note — e due definizioni della stessa firma sono peggio di nessuna.
 */
const AUTORE_PREDEFINITO = FIRMA_REDAZIONE;

/** Ancore della pagina ospite: la dichiarazione rimanda, non contiene. */
const METODOLOGIA = "#metodologia";
const FONTI = "#fonti";

const RIMANDO =
  "font-semibold text-teal underline decoration-dotted underline-offset-2 hover:no-underline";

/**
 * Il filo persistente.
 *
 * L'argomento che lo giustifica è di durata, non di forma: la barra in alto è
 * `sticky`, quindi lo stemma resta sullo schermo per tutta la lettura, mentre
 * una dichiarazione in cima sparisce al primo scorrimento. Se le due
 * affermazioni non durano lo stesso, vince quella che resta — e quella che
 * resta è l'attribuzione al Comune.
 *
 * `top-16` è l'altezza della barra in alto (`h-16` in `top-bar.tsx`): sono
 * accoppiati e vanno cambiati insieme.
 */
function Filo() {
  return (
    <div
      className={cn(
        /*
          `items-start` e non `items-center`: a 360px in modalità semplice la
          frase va a tre righe (64px misurati) e un pallino centrato
          verticalmente galleggia a metà del blocco invece di marcarne
          l'inizio.
        */
        "sticky top-16 z-20 flex items-start gap-2 rounded-b-[var(--radius-sm)]",
        "border border-t-0 border-border bg-surface/95 px-3 py-2 backdrop-blur-lg print:hidden",
      )}
    >
      <span
        className="mt-[5px] size-2 shrink-0 rounded-full bg-viola"
        aria-hidden
      />
      <p className="min-w-0 text-[12px] leading-tight text-muted">
        <span className="font-semibold text-foreground">
          Sezione redazionale
        </span>{" "}
        — non è una comunicazione del Comune di Pistoia.{" "}
        <Link href="#chi-pubblica" className={RIMANDO}>
          Chi pubblica
        </Link>
      </p>
    </div>
  );
}

/**
 * Il cartiglio.
 *
 * Registro documentale: separa in due colonne *chi scrive* e *chi fornisce i
 * numeri*, che è la coppia che il prerequisito chiede di dichiarare — una
 * frase sola ne direbbe metà. È anche la forma che regge la citazione da parte
 * di un giornale, cioè lo scopo dichiarato dell'«Audit cittadino».
 */
function Cartiglio({ autore }: { autore: string }) {
  return (
    <aside
      id="chi-pubblica"
      aria-label="Chi pubblica questa pagina"
      className="card scroll-mt-24 p-5 sm:p-6"
    >
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        <span className="size-2 rounded-full bg-viola" aria-hidden />
        Chi pubblica questa pagina
      </p>

      {/* `grid-cols-1` esplicito e `min-w-0` sulle celle: senza la variante di
          base la traccia implicita è `auto`, il cui minimo è il min-content, e
          sotto `sm` la pagina scorre di lato (AGENTS.md §3, ondata 7, 5). */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 sm:divide-x sm:divide-border">
        <div className="min-w-0 sm:pr-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-2">
            <PenLine size={13} aria-hidden />
            Scrive il giudizio
          </p>
          <p className="mt-1.5 text-[15px] font-semibold leading-snug">
            {autore}
          </p>
          <p className="mt-1 text-xs text-muted">
            Con una{" "}
            <Link href={METODOLOGIA} className={RIMANDO}>
              metodologia pubblica e versionata
            </Link>
            , che questa pagina cita nel proprio timbro.
          </p>
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-2">
            <Database size={13} aria-hidden />
            Fornisce i numeri
          </p>
          <p className="mt-1.5 text-[15px] font-semibold leading-snug">
            Comune di Pistoia — Amministrazione trasparente
          </p>
          <p className="mt-1 text-xs text-muted">
            Più ISTAT per i confronti con il reddito.{" "}
            <Link href={FONTI} className={RIMANDO}>
              Ogni cifra porta il link al documento
            </Link>
            .
          </p>
        </div>
      </div>

      <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted">
        <span className="font-semibold text-foreground">
          Il Comune non è l&apos;autore di questa pagina
        </span>{" "}
        e ha diritto di replica: la risposta compare qui, allo stesso corpo del
        giudizio.
      </p>
    </aside>
  );
}

/**
 * Va in cima a ogni pagina che esprime un giudizio — pagella, dossier persona,
 * audit cittadino. **Primo elemento del contenitore**: il filo è `sticky` e si
 * aggancia sotto la barra in alto, quindi se qualcosa lo precede si aggancia
 * più in basso e scopre proprio la parte alta della pagina.
 */
export function ChiPubblica({
  autore = AUTORE_PREDEFINITO,
}: {
  autore?: string;
}) {
  return (
    <>
      <Filo />
      <Cartiglio autore={autore} />
    </>
  );
}
