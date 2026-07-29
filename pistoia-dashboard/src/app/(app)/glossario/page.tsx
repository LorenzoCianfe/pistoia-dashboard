import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { GLOSSARY } from "@/lib/glossary";
import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Glossario",
  description:
    "I termini amministrativi che si incontrano sulla piattaforma, spiegati in linguaggio semplice.",
};

/*
  Glossario dei termini amministrativi (A2 §27, O3 quick win). Contenuto
  redazionale statico da lib/glossary.ts: lo stesso che alimenta i tooltip
  <GlossaryTip> sparsi nelle pagine (es. Bilancio).
*/

export default function GlossarioPage() {
  const sorted = [...GLOSSARY].sort((a, b) =>
    a.term.localeCompare(b.term, "it"),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Glossario della città"
        description="«Avanzo», «delibera», «RUP»: la burocrazia ha le sue parole. Qui le trovi tradotte in linguaggio cittadino."
        icon={<BookOpenText size={26} />}
      />

      {/*
        L'indice apre la pagina al posto di una cifra display, e la scelta è
        motivata (Fase B, secondo scaglione): «13 termini spiegati» sarebbe un
        numero di vanità — vero, ma non è la ragione per cui qualcuno arriva
        qui. Su un glossario si arriva con UNA parola in testa, e ciò che il
        contenuto dice nel suo insieme è quali parole copre. Stessa famiglia
        dell'esclusione di /digest: dove nessun numero è la notizia, la cifra
        non si mette per simmetria (FEATURES.md §5).

        Le àncore esistevano già sui termini — sono quelle che usa <GlossaryTip>
        — ma senza `scroll-mt` finivano sotto la barra in alto, che è appiccicata.
      */}
      <Card>
        <CardEyebrow>Le parole spiegate</CardEyebrow>
        <ul className="mt-3 flex flex-wrap gap-2">
          {sorted.map((t) => (
            <li key={t.slug}>
              <a
                href={`#${t.slug}`}
                className="inline-flex rounded-pill border border-border bg-surface-2/60 px-3 py-1.5 text-sm transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                {t.term}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <dl className="divide-y divide-border">
          {sorted.map((t) => (
            <div
              key={t.slug}
              id={t.slug}
              className="scroll-mt-20 py-4 first:pt-1 last:pb-1"
            >
              <dt className="flex flex-wrap items-baseline gap-2">
                <span className="font-display text-lg font-semibold tracking-tight">
                  {t.term}
                </span>
                {t.context ? (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                    {t.context}
                  </span>
                ) : null}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                {t.definition}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          Manca una parola? Chiedila in Comunità: il glossario cresce con le
          domande dei cittadini.
        </p>
      </Card>
    </div>
  );
}
