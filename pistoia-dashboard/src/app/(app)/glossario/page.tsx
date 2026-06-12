import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { GLOSSARY } from "@/lib/glossary";
import { Card } from "@/components/ui/card";
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

      <Card>
        <dl className="divide-y divide-border">
          {sorted.map((t) => (
            <div key={t.slug} id={t.slug} className="py-4 first:pt-1 last:pb-1">
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
