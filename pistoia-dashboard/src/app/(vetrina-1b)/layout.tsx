import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { PreviewBadge } from "@/components/ui/badge";
import { CambioTema } from "@/components/brand/transizione-scena";

/*
  IL GUSCIO DELL'ANTEPRIMA — solo per `/home-1b` (2026-08-15).

  🔴 **Serve a NON toccare `/`.** Lorenzo ha chiesto di portare il linguaggio dei
  controlli di Homepage_2 anche su Homepage_1, «e se possibile di vederla in
  anteprima». Le due cose insieme si ottengono solo così: la composizione resta
  quella, congelata, e qui c'è un guscio che la riveste. Se il linguaggio
  convince, queste righe spariscono dentro `(vetrina)`; se non convince,
  spariscono e basta.

  La testata è la STESSA di `(vetrina)` — marchio a sinistra, voci al centro,
  interruttore a destra — cambiata in una cosa sola: le voci e l'interruttore
  portano `.ctrl` invece delle pastiglie di sistema. La disposizione non si
  tocca, perché il confronto deve essere sul **materiale**, non sul layout: due
  variabili insieme non si giudicano.

  ⚠️ `data-stile="vetro"` avvolge il `<main>`, non l'`<html>`: è l'interruttore
  che fa arrivare le regole di `.ctrl` ai `.btn` che stanno **dentro** la pagina
  di Homepage_1, quella che non si può modificare. Le regole sono in
  `globals.css`, in fondo al blocco dei controlli.
*/

const VOCI = [
  { href: "/atti", label: "Atti" },
  { href: "/valutazioni", label: "Servizi" },
  { href: "/metodologia", label: "Come lavoriamo" },
];

export default function Vetrina1bLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh" data-stile="vetro">
      <a
        href="#contenuto"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-pill focus-visible:bg-surface focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:shadow-lg"
      >
        Salta al contenuto
      </a>

      <header className="absolute inset-x-0 top-0 z-20 print:hidden">
        <div className="mx-auto flex h-20 max-w-guscio items-center gap-6 px-4 sm:px-6">
          <span className="flex shrink-0 items-center gap-2.5">
            <Wordmark />
            <PreviewBadge className="hidden lg:inline-flex" />
          </span>

          {/* Le voci nella barra di vetro, come su `/home-2`: qui è l'unica
              differenza rispetto alla testata di `/`. */}
          <nav aria-label="Sezioni" className="hidden md:block">
            <ul className="ctrl ctrl-menu">
              {VOCI.map((v) => (
                <li key={v.href}>
                  <Link href={v.href} className="ctrl-menu__voce">
                    {v.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <CambioTema className="ctrl ctrl-tondo" />
          </div>
        </div>
      </header>

      <main id="contenuto" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </div>
  );
}
