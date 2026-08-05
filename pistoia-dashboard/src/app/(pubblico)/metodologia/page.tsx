import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  IN_BREVE,
  REGISTRO_MODIFICHE,
  REGOLE,
  VERSIONE_METODOLOGIA,
} from "@/lib/metodologia";
import { FIRMA_REDAZIONE } from "@/lib/redazione";

export const metadata: Metadata = {
  title: "Metodologia — Valutazioni dei servizi",
  description:
    "Le regole con cui le valutazioni dei servizi vengono raccolte, calcolate e moderate: ogni regola con il suo perché, la sua verifica e il punto del codice che la applica.",
};

/*
  `/metodologia` — la resa del documento (R-6, forma A1 + A3 + A4, decisa il
  2026-08-05). Il CONTENUTO vive in `lib/metodologia.ts`, che interpola le
  costanti di dominio: questa pagina non contiene un numero scritto a mano.

  A LETTURA PUBBLICA (forma C1), coerente con W1: le schede che chiunque può
  leggere citano queste regole, e un rimando che chiede il login sarebbe una
  spiegazione a porte chiuse. Il gruppo `(pubblico)` dà i due regimi: AppShell
  con la sessione, barra anonima senza.

  La pagina PUBBLICA le regole, non ne inventa: ognuna esiste nel codice e la
  riga «Nel codice» dice dove — è il cancello della fase reso leggibile.
*/
export default function MetodologiaPage() {
  const ultimaModifica = REGISTRO_MODIFICHE[0];

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Le regole del gioco"
        title="Metodologia delle valutazioni"
        description="Come le valutazioni dei servizi vengono raccolte, calcolate e moderate — regola per regola, col perché di ciascuna."
        icon={<BookOpen size={22} />}
      />

      {/* La versione, subito: è ciò che le altre pagine timbrano. */}
      <p className="text-sm text-muted">
        Versione{" "}
        <strong className="text-foreground">v{VERSIONE_METODOLOGIA}</strong> ·
        in vigore dal {formatData(ultimaModifica.data)} · ogni modifica passa
        dal{" "}
        <a href="#registro" className="text-teal underline-offset-2 hover:underline">
          registro
        </a>
        , mai dal silenzio.
      </p>

      {/* In breve (A4): per chi non leggerà le dodici regole. */}
      <Card className="bg-surface-2/40">
        <CardEyebrow>In breve</CardEyebrow>
        <ul className="mt-3 space-y-2">
          {IN_BREVE.map((riga) => (
            <li
              key={riga}
              className="flex gap-2.5 text-sm leading-relaxed text-muted"
            >
              <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]" />
              <span>{riga}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Le dodici regole (A1): la regola · il perché · la verifica · il codice. */}
      <section aria-label="Le regole" className="space-y-4">
        {REGOLE.map((r, i) => (
          <Card key={r.id} id={r.id} className="scroll-mt-24">
            <article>
              <h2 className="text-base font-semibold">
                <span className="text-muted-2">{i + 1} · </span>
                {r.titolo}
              </h2>
              <p className="mt-2 max-w-prose text-sm font-medium leading-relaxed">
                {r.regola}
              </p>
              <dl className="mt-3 space-y-2.5 border-t border-border pt-3">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                    Il perché
                  </dt>
                  <dd className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
                    {r.perche}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                    La verifica
                  </dt>
                  <dd className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
                    {r.verifica}
                  </dd>
                </div>
              </dl>
              {/* Il cancello reso leggibile (A3): la definizione unica. */}
              <p className="mt-3 rounded-inner bg-surface-2/60 px-3 py-2 font-mono text-xs leading-relaxed text-muted">
                <span className="font-sans font-semibold uppercase tracking-[0.1em] text-muted-2">
                  Nel codice
                </span>{" "}
                — {r.nelCodice}
              </p>
            </article>
          </Card>
        ))}
      </section>

      {/* Il registro delle modifiche: append-only, come le rimozioni. */}
      <Card id="registro" className="scroll-mt-24">
        <CardEyebrow>Registro delle modifiche</CardEyebrow>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          Una metodologia che cambia in silenzio è il modo in cui una media
          scomoda viene soppressa. Ogni versione resta scritta qui: le voci si
          aggiungono, non si riscrivono.
        </p>
        <ol className="mt-3 space-y-3">
          {REGISTRO_MODIFICHE.map((v) => (
            <li key={v.versione} className="border-t border-border pt-3 text-sm">
              <p className="font-medium">
                v{v.versione}{" "}
                <span className="font-normal text-muted-2">
                  · {formatData(v.data)}
                </span>
              </p>
              <p className="mt-1 max-w-prose leading-relaxed text-muted">
                {v.cosa}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-2">
          {FIRMA_REDAZIONE} · le regole si discutono:{" "}
          <Link
            href="/valutazioni"
            className="text-teal underline-offset-2 hover:underline"
          >
            le valutazioni
          </Link>{" "}
          sono il posto dove vederle applicate.
        </p>
      </Card>
    </div>
  );
}

/** «2026-08-05» → «5 agosto 2026», senza inventare fusi: la data è già un giorno. */
function formatData(iso: string): string {
  const [anno, mese, giorno] = iso.split("-").map(Number);
  return new Date(Date.UTC(anno, mese - 1, giorno)).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
