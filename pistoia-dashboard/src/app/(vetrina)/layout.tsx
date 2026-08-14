import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { PreviewBadge } from "@/components/ui/badge";
import { CambioTema } from "@/components/brand/transizione-scena";

/*
  IL GUSCIO DELLA VETRINA — solo per `/` (2026-08-14).

  Esiste perché la prima pagina nuova è **una schermata sola sopra una
  fotografia**, e il guscio di `(pubblico)` non può ospitarla: quello incapsula
  il contenuto in un contenitore con tetto e padding e ci appende il footer
  sotto, cioè esattamente le tre cose che rompono un fullscreen.

  ⚠️ Non è una duplicazione del guscio pubblico: è un guscio **diverso**, e la
  differenza è dichiarata. La testata qui galleggia sopra la scena invece di
  poggiare su una superficie, e non c'è footer — la riga di chiusura è dentro
  la pagina, al piede della schermata, come nel mockup.

  ⚠️ **Uguale per tutti, autenticati o no.** La vetrina è la porta d'ingresso e
  non cambia forma a seconda di chi bussa. L'ingresso è uno solo — il pulsante
  «Entra nella mia città» nell'apertura, che porta a `/la-mia-citta`: chi ha
  una sessione entra, chi non ce l'ha viene mandato al login e poi torna lì.
  In testata è rimasto il solo interruttore del tema.
*/

/** Le voci della testata. Puntano solo a rotte che esistono e sono leggibili
 *  senza account: un menu di porte chiuse è una presa in giro (`(pubblico)`
 *  lo dice dal 2026-08-04, e vale a maggior ragione sulla vetrina). */
const VOCI = [
  { href: "/atti", label: "Atti" },
  { href: "/valutazioni", label: "Servizi" },
  { href: "/metodologia", label: "Come lavoriamo" },
];

export default function VetrinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <a
        href="#contenuto"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-pill focus-visible:bg-surface focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:shadow-lg"
      >
        Salta al contenuto
      </a>

      {/* La testata GALLEGGIA: nessuno sfondo, nessun filo sotto. Sta sopra la
          scena e la lascia vedere, che è il gesto del mockup. */}
      <header className="absolute inset-x-0 top-0 z-20 print:hidden">
        <div className="mx-auto flex h-20 max-w-guscio items-center gap-6 px-4 sm:px-6">
          <span className="flex shrink-0 items-center gap-2.5">
            <Wordmark />
            <PreviewBadge className="hidden lg:inline-flex" />
          </span>

          <nav aria-label="Sezioni" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {VOCI.map((v) => (
                <li key={v.href}>
                  <Link
                    href={v.href}
                    className="inline-flex min-h-11 items-center rounded-pill px-3.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    {v.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/*
            A destra resta il solo interruttore del tema (2026-08-14, Lorenzo:
            «togli il pulsante in alto a destra e l'icona della search»).
            L'ingresso non vive più qui: è il pulsante «Entra nella mia città»
            nell'apertura, che è la porta unica della pagina. La ricerca
            tornerà con l'archivio degli atti, dove ha un campo vero.
          */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* L'interruttore del tema è QUI il cambio-scena: premendolo, sulla
                prima pagina passa un'ora del giorno sulla città. */}
            <CambioTema className="btn btn-tondo" />
          </div>
        </div>
      </header>

      <main id="contenuto" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </div>
  );
}
