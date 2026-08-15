import Link from "next/link";

import { PreviewBadge } from "@/components/ui/badge";
import { CambioTema } from "@/components/brand/transizione-scena";

/*
  IL GUSCIO DELLA VETRINA 2 — solo per `/home-2` (2026-08-15).

  ⚠️ **È un GRUPPO DI ROTTE a parte, non una sottocartella di `(vetrina)`.**
  Un layout annidato in Next si somma a quello sopra: `home-2` messa dentro
  `(vetrina)` avrebbe ereditato la sua testata e ne avrebbe disegnate due. Qui
  serve una testata **diversa** — menu e interruttore stanno insieme a destra,
  come nel riferimento — quindi la strada è un gruppo suo.

  🔴 **Homepage_1 non si tocca.** `(vetrina)` resta esattamente com'è e continua
  a servire `/`: le due varianti si confrontano aprendo due schede, e la
  decisione su quale vada in prima pagina resta di Lorenzo.

  Che cosa CONDIVIDONO le due (e deve restare condiviso, o divergono in
  silenzio): il marchio, i token del tema, la scena fotografica e **tutto il
  meccanismo giorno↔notte** — `CambioTema` è lo stesso componente, quindi
  `--tema-t`, il lucchetto e la sincronia col filmato valgono qui identici,
  senza una riga in più.
*/

/** Le stesse destinazioni della vetrina: rotte che esistono e si leggono senza
 *  account. Un menu di porte chiuse è una presa in giro. */
const VOCI = [
  { href: "/atti", label: "Atti" },
  { href: "/valutazioni", label: "Servizi" },
  { href: "/metodologia", label: "Come lavoriamo" },
];

export default function Vetrina2Layout({
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

      {/*
        LA TESTATA GALLEGGIA, e tutto sta a DESTRA (scelta di Lorenzo,
        2026-08-15). A sinistra resta solo la pastiglia «Anteprima», che non è
        decorazione: dichiara che i dati sono dimostrativi, ed è un obbligo di
        questo progetto prima che una scelta di composizione.

        ⚠️ Niente marchio in testata, ed è deliberato: il marchio QUI è la
        scritta gigante della scena. Ripeterlo in alto a sinistra lo
        raddoppierebbe a due centimetri di distanza, che è il modo più rapido di
        togliergli la scala che gli si è appena data.
      */}
      <header className="absolute inset-x-0 top-0 z-30 print:hidden">
        <div className="mx-auto flex h-20 max-w-guscio items-center gap-6 px-4 sm:px-6">
          {/* ⚠️ Visibile a OGNI larghezza, e qui non è come in `(vetrina)`.
              Là la pastiglia può nascondersi sul telefono perché accanto c'è
              comunque il marchio; qui il marchio in testata non c'è — sta nella
              scena — quindi nasconderla lascerebbe una testata con dentro il
              solo interruttore, e soprattutto toglierebbe dalla prima schermata
              l'unica riga che dichiara che i dati sono dimostrativi. */}
          <PreviewBadge className="shrink-0" />

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/*
              🔴 IL MENU VIVE IN UNA CAPSULA DI VETRO, e non è decorazione.

              Nella vetrina di Homepage_1 le voci galleggiano sulla foto e si
              leggono, perché lì cadono sulla zona di cielo a sinistra. Qui
              stanno **a destra, sopra la fotografia piena** — tetti caldi di
              giorno, tetti scuri di notte — e `--muted` su quel fondo si perde:
              misurato a occhio sulla prima cattura, le tre voci erano
              praticamente illeggibili sul cielo chiaro. La capsula ridà loro una
              superficie, che è la condizione perché i token del testo tornino a
              significare quello per cui sono stati misurati.

              È lo stesso materiale del pannello e della pastiglia d'invito, non
              un componente nuovo.
            */}
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

            {/* Lo stesso interruttore di Homepage_1 — premendolo passa un'ora
                del giorno sulla città — ma vestito come tutto il resto: guscio
                di vetro leggero, filo di 1px, nessuna ombra. Non porta `.btn`,
                quindi non porta nemmeno `--elev-rest`. */}
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
