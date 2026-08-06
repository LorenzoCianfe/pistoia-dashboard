import Link from "next/link";
import { Lock } from "lucide-react";
import { Crest } from "@/components/brand/crest";
import { UTILITY_NAV } from "./nav-items";
import { DEMO_MODE } from "@/lib/demo";

/**
 * Le pagine che spiegano il PROGETTO invece della città.
 *
 * Stanno in una colonna loro, separata da `UTILITY_NAV`, per una ragione di
 * sostanza e non di simmetria: **queste sono tutte a lettura pubblica, quelle
 * chiedono un account**. Finché i due insiemi coincidono con quella
 * differenza, la colonna è anche la spiegazione del lucchetto in fondo.
 *
 * `/metodologia` sta qui dal 2026-08-05 (decisione di Lorenzo): è pubblica, ed
 * è il regolamento che le schede di `/valutazioni` citano già nel corpo.
 */
const PROGETTO = [
  { href: "/metodologia", label: "Metodologia" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie", label: "Cookie" },
  { href: "/note-comunita", label: "Regole community" },
];

/**
 * Il footer, ridisegnato il 2026-08-05 (Lavoro D, punto 1).
 *
 * Nasce da una domanda mai chiusa — che cosa vede nel footer chi NON ha un
 * account — e da sei difetti misurati sulla versione precedente:
 *
 * 1. i due gruppi esistevano solo negli `aria-label`: a schermo erano sette
 *    parole su due righe, e nulla diceva perché fossero due;
 * 2. si distinguevano per `#5A5D61`/500 contro `#65686C`/400, cioè per un
 *    capello — troppo poco per leggersi come raggruppamento;
 * 3. la gerarchia era rovesciata: il blocco d'identità rendeva a **15px** e i
 *    link a 12px, perché `text-xs` stava sul contenitore e il reset di Astryx
 *    dichiara `font-size` direttamente su `:where(p)` (`AGENTS.md` §3 — la
 *    trappola era documentata per il *colore*, ma vale identica qui). Adesso
 *    ogni dimensione sta sull'elemento che la usa;
 * 4. `flex-wrap` più `sm:items-end` spezzava le righe dove capitava e le
 *    allineava a destra: la combinazione più difficile da scorrere;
 * 5. i bersagli erano alti **16px**, contro i ≥44px di `DESIGN.md` §11.6 (e i
 *    24 di WCAG 2.2). Il cancello axe non poteva vederlo: gira sulle regole
 *    `wcag2aa`/`wcag21aa`, e `target-size` è 2.2;
 * 6. non portava identità: la pagina semplicemente finiva, con un filo.
 *
 * La forma scelta (proposta 2 di tre) risponde al sesto col **materiale invece
 * che con un ornamento**: il footer è una scheda di vetro appoggiata sulla
 * tela, come ogni altra superficie dell'applicazione (`DESIGN.md` §4 e §6).
 *
 * ⚠️ **Non si centra e non si impagina da sé.** Il contenitore che lo ospita
 * decide larghezza e margini: dentro `AppShell` e `(pubblico)` è già la colonna
 * di `main`, in `(legal)` c'è un involucro apposta. Rimettere qui dentro un
 * `mx-auto max-w-6xl px-4` raddoppierebbe il padding degli antenati.
 *
 * ⚠️ **Le soglie sono `@container`, non `sm:`/`lg:`, e non è un vezzo.** Le
 * varianti normali guardano la FINESTRA, e questo footer vive in due colonne di
 * larghezza molto diversa: ~850px dentro `AppShell`, **640px** sulle pagine
 * legali (`max-w-2xl`). Con `lg:flex-row` a 1440px di finestra la variante
 * scattava anche nella colonna stretta, e lì i 640px si dividevano in
 * 320 di identità più due colonne da ~82px: «FAQ della città» andava a capo,
 * «IL PROGETTO» pure. Misurato su `screenshots/wave/privacy-light.png`. Con
 * `@container` la soglia è la larghezza del footer stesso, che è la sola cosa
 * che conta per decidere se le colonne ci stanno.
 */
export function Footer({ autenticato = false }: { autenticato?: boolean }) {
  return (
    <footer className="card @container mt-8 px-6 py-8 sm:px-8 sm:py-9 print:hidden">
      <div className="flex flex-col gap-9 @3xl:flex-row @3xl:items-start @3xl:justify-between">
        <div className="flex min-w-0 max-w-xs flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white shadow-sm ring-1 ring-border">
              <Crest className="h-4 w-auto" />
            </span>
            <span className="text-[13.5px] font-semibold tracking-tight">
              Dashboard di Pistoia
            </span>
          </span>
          <p className="text-xs leading-relaxed text-muted-2">
            Progetto dimostrativo. I dati mostrati sono di esempio e non
            rappresentano fonti ufficiali.
            {DEMO_MODE ? (
              <span className="ml-1.5 rounded-pill bg-amber-soft px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                demo
              </span>
            ) : null}
          </p>
        </div>

        {/* `grid-cols-1` accanto a `@sm:grid-cols-2` non è ridondante: senza,
            sotto la soglia non esiste alcun `grid-template-columns` e la
            traccia implicita `auto` si ferma al min-content dei figli
            (AGENTS.md §3, ondata 7, 5). */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 @sm:grid-cols-2">
          <ColonnaFooter titolo="La città" voci={UTILITY_NAV} />
          <ColonnaFooter titolo="Il progetto" voci={PROGETTO} />
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-5 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        {/* La dichiarazione sta QUI e non sulle colonne (forma «iii»): chi ha
            già un account non la incontra affatto, e le colonne restano
            pulite. Il `?next=` verso la pagina che interessa lo mette il
            proxy sul link cliccato, non questo pulsante generico.

            Il lucchetto è INLINE dentro la frase, non un elemento flex
            accanto: da elemento a sé, in una colonna stretta la frase gli
            andava sotto e restava **da solo su una riga** — un'icona orfana
            che sembra un guasto. Inline scorre col testo, come una parola. */}
        {autenticato ? null : (
          <p className="self-start rounded-pill bg-teal-soft px-3.5 py-1.5 text-xs leading-relaxed text-teal-strong">
            <Lock
              size={12}
              aria-hidden
              className="mr-1.5 inline-block align-[-1px]"
            />
            Avvisi, organigramma, FAQ e glossario si aprono con un account.{" "}
            <Link
              href="/login"
              className="font-semibold underline underline-offset-2"
            >
              Accedi
            </Link>
          </p>
        )}
        <p className="text-[11.5px] text-muted-2">
          Comune di Pistoia · anteprima pubblica
        </p>
      </div>
    </footer>
  );
}

/**
 * Una colonna del footer, col titolo VISIBILE e non solo nell'`aria-label`.
 *
 * `min-h-11` sono i 44px di `DESIGN.md` §11.6: il bersaglio è la riga intera,
 * non le lettere. È il motivo per cui il footer è più alto di prima, ed è il
 * prezzo giusto — la versione precedente ne offriva 16.
 */
function ColonnaFooter({
  titolo,
  voci,
}: {
  titolo: string;
  voci: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={titolo} className="flex min-w-0 flex-col">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {titolo}
      </p>
      {voci.map((v) => (
        <Link
          key={v.href}
          href={v.href}
          className="flex min-h-11 items-center text-[13px] text-muted transition-colors hover:text-foreground"
        >
          {v.label}
        </Link>
      ))}
    </nav>
  );
}
