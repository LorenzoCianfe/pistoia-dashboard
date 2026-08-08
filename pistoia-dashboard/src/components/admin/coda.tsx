import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  LISTA + DETTAGLIO — il guscio condiviso delle code dell'Area Comune.

  Nasce dal debito lasciato aperto dal taglio di `/admin`
  (`docs/piano-admin.md` §6): le code fatte di moduli impilati non reggono la
  crescita, perché il modulo di lavoro è alto ~320px e si moltiplica per il
  numero di voci. Misurato il 2026-08-07 sul triage: **4.680px di contenuto**
  con le 14 segnalazioni aperte del seed, tenuti a bada da un riquadro che
  scorre — cioè da un cerotto, non da un rimedio.

  La forma, decisa da Lorenzo sui mockup: **la riga compatta porta alla pagina
  della voce, e su desktop la lista resta a fianco.** Le due misure che l'hanno
  decisa, a 1280: la riga compatta è **69px** contro i **323** del modulo, e il
  dettaglio è **836px COSTANTI** — con quattordici voci in coda o con
  quattrocento. È l'unica altezza di tutta l'area che non dipende da quanto
  lavoro c'è.

  ⚠️ **`@container` e non `sm:`/`lg:`**, perché la stessa riga vive a due
  larghezze molto diverse: ~804px sull'indice e **304px** nella colonna del
  dettaglio. È la regola di `DESIGN.md` §6, pagata sul footer il 2026-08-05 —
  le varianti di finestra scattano in tutte e due, e nella colonna stretta
  spaccano la riga.
*/

/**
 * Il guscio della pagina di dettaglio: lista a sinistra, lavoro a destra.
 *
 * Sotto `@3xl` (768px di contenitore, cioè sotto ~1024px di finestra) la lista
 * **non c'è**: al suo posto il collegamento di ritorno. Non è una rinuncia —
 * su un telefono una lista da 14 voci sopra il modulo significherebbe scorrerla
 * tutta a ogni voce, che è il difetto da cui veniamo.
 */
export function CodaConDettaglio({
  lista,
  children,
}: {
  lista: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="@container">
      <div className="grid gap-5 @3xl:grid-cols-[19rem_minmax(0,1fr)]">
        {/*
          Il riquadro che scorre torna qui, ed è il posto giusto: limita la
          LISTA, non il lavoro. Nel triage limitava i moduli, cioè nascondeva
          12 voci su 14 dentro una finestra da 576px.
        */}
        <div className="@max-3xl:hidden max-h-[34rem] overflow-y-auto pr-1">
          {lista}
        </div>
        <div className="min-w-0 @3xl:border-l @3xl:border-border @3xl:pl-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Il ritorno alla lista: c'è solo dove la lista non si vede già di fianco. */
export function TornaAllaCoda({ href, testo }: { href: string; testo: string }) {
  return (
    <p className="hidden text-xs @max-3xl:block">
      <Link
        href={href}
        className="inline-flex min-h-11 items-center gap-1 text-teal hover:underline"
      >
        <ChevronLeft size={14} aria-hidden />
        {testo}
      </Link>
    </p>
  );
}

/**
 * L'elenco vero e proprio: una `<ul>` di `VoceCoda`, o lo stato vuoto.
 *
 * `quante` si passa esplicitamente invece di dedurlo dai figli: contare i figli
 * di un `ReactNode` funziona finché nessuno ci mette un frammento o un `null`,
 * e poi smette di funzionare in silenzio. Chi chiama il numero ce l'ha.
 */
export function ElencoCoda({
  quante,
  vuoto,
  children,
}: {
  quante: number;
  vuoto: string;
  children: ReactNode;
}) {
  if (quante === 0) {
    return (
      <p className="rounded-[var(--radius-sm)] border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
        {vuoto}
      </p>
    );
  }
  return <ul className="space-y-2">{children}</ul>;
}

/**
 * Una riga della coda.
 *
 * `children` è la riga di meta sotto il titolo: pastiglie e testo. La decide
 * chi la usa, e può nascondere quel che non entra nella colonna stretta con
 * `@max-sm:hidden` — il contenitore più vicino è **questa riga**, non la
 * pagina, che è tutto il punto di metterci `@container`.
 */
export function VoceCoda({
  href,
  titolo,
  attiva = false,
  children,
}: {
  href: string;
  titolo: string;
  attiva?: boolean;
  children: ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={attiva ? "page" : undefined}
        className={cn(
          /*
            `min-h-11` sono i 44px di `DESIGN.md` §11.6. Il bordo c'è **a
            riposo** e non solo all'`:hover`: la riga è l'unico modo di aprire
            una voce, e un controllo riconoscibile solo col mouse su un telefono
            non si riconosce mai (§6, 2026-08-07).
          */
          "@container flex min-h-11 items-start gap-3 rounded-[var(--radius-sm)] border px-3.5 py-2.5 transition-colors",
          attiva
            ? "border-teal bg-surface-2"
            : "border-border bg-surface-2/40 hover:border-teal",
        )}
      >
        <span className="min-w-0 flex-1">
          {/*
            Tronca solo dove c'è larghezza: a 304px il titolo va a capo, che è
            meglio di «Attraversamento pedonale sbia…» su ogni riga. Il tetto di
            due righe serve alle code senza titolo — «Domande» e «Valutazioni»
            mettono qui il testo del cittadino, che può essere lungo quanto
            vuole, e senza tetto una riga della lista arriverebbe a sei righe.
          */}
          <span className="block text-sm font-semibold leading-snug text-foreground @sm:truncate @max-sm:line-clamp-2">
            {titolo}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-2">
            {children}
          </span>
        </span>
        <ChevronRight
          size={16}
          className={cn("mt-1.5 shrink-0", attiva ? "text-teal" : "text-muted-2")}
          aria-hidden
        />
      </Link>
    </li>
  );
}

/**
 * «Questa voce è uscita dalla coda».
 *
 * Serve perché il dettaglio si prende **per id e non dalla coda**
 * (`lib/data/admin.ts`): ogni azione riuscita toglie la voce dalla propria
 * coda, e una pagina che interrogasse la coda risponderebbe 404 proprio dopo
 * che l'operatore ha fatto la cosa giusta.
 */
export function FuoriDallaCoda({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-dashed border-border-strong px-3.5 py-3 text-sm text-muted">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
