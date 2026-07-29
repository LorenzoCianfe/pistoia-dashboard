import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Landmark, MessagesSquare } from "lucide-react";
import { getCityFaqs, type CityFaqItem } from "@/lib/data/transparency";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DisplayNumber } from "@/components/signature/display-number";
import { faqCategory } from "@/lib/transparency";
import { formatDateShort, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "FAQ della città",
  description:
    "Le domande che i cittadini fanno più spesso, con la risposta ufficiale del Comune.",
};

/*
  FAQ della città (A1 §11, O3): le domande ricorrenti dei cittadini diventano
  conoscenza pubblica riutilizzabile. Il badge "Risposta ufficiale" distingue
  i contenuti del Comune dalle discussioni della community.
*/

function OfficialBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold"
      style={{ color: "var(--teal-strong)", backgroundColor: "var(--teal-soft)" }}
    >
      <Landmark size={11} aria-hidden />
      Risposta ufficiale
    </span>
  );
}

export default async function FaqPage() {
  const faqs = await getCityFaqs();

  // Raggruppa per categoria: l'ordine dei gruppi segue la prima occorrenza
  // nell'ordine redazionale, anche se le domande non sono adiacenti.
  const byCategory = new Map<string | null, CityFaqItem[]>();
  for (const f of faqs) {
    const list = byCategory.get(f.category);
    if (list) list.push(f);
    else byCategory.set(f.category, [f]);
  }
  const groups = [...byCategory.entries()].map(([category, items]) => ({
    category,
    items,
  }));

  /*
    La cifra conta le risposte UFFICIALI, non le domande pubblicate.

    Sono righe vere di `CityFaq` e non c'è nessun `demoBaseline` di mezzo. Sui
    dati dimostrativi il numero coincide col totale perché `official` ha default
    `true`, ma non è una tautologia: quello che dichiara è la tesi della pagina —
    ogni risposta qui è del Comune, non un'ipotesi della community — ed è la
    definizione che regge anche il giorno in cui una FAQ non lo sarà.

    Nessuna scala a tacche: nessuno ha fissato quante FAQ debbano esistere, e
    una tacca su 0→totale si leggerebbe come un obiettivo (FEATURES.md §5).
  */
  const ufficiali = faqs.filter((f) => f.official).length;
  const aggiornataAl = faqs.reduce<Date | null>(
    (max, f) => (max === null || f.updatedAt > max ? f.updatedAt : max),
    null,
  );

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="FAQ della città"
        description="Se molti cittadini fanno la stessa domanda, la risposta merita di essere pubblica: qui trovi quelle ufficiali, sempre aggiornate."
        icon={<HelpCircle size={26} />}
      />

      {faqs.length === 0 ? (
        <EmptyState
          title="Nessuna FAQ pubblicata"
          description="Quando le domande ricorrenti dei cittadini riceveranno una risposta ufficiale, le troverai qui."
        />
      ) : (
        <>
          <Card>
            <DisplayNumber
              value={ufficiali}
              unit={ufficiali === 1 ? "risposta" : "risposte"}
              label="Ufficiali del Comune"
            />
            <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
              alle domande che i cittadini fanno più spesso, in{" "}
              {formatNumber(groups.length)}{" "}
              {groups.length === 1 ? "categoria" : "categorie"}
              {aggiornataAl ? (
                <span suppressHydrationWarning>
                  {" · "}l&apos;ultima aggiornata il{" "}
                  {formatDateShort(aggiornataAl)}
                </span>
              ) : null}
              .
            </p>
          </Card>

          <div className="space-y-5 stagger">
            {groups.map((g) => (
              <Card key={g.category ?? "altro"}>
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2">
                  {faqCategory(g.category)}
                </h2>
                <div className="mt-2 divide-y divide-border">
                  {g.items.map((f) => (
                    <details key={f.id} className="group py-3">
                      <summary className="cursor-pointer list-none marker:hidden">
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-medium">{f.question}</span>
                          <span
                            className="mt-0.5 text-muted-2 transition-transform group-open:rotate-45"
                            aria-hidden
                          >
                            +
                          </span>
                        </span>
                      </summary>
                      <div className="mt-2 space-y-2">
                        {f.official ? <OfficialBadge /> : null}
                        <p className="text-sm leading-relaxed text-muted">
                          {f.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Card className="flex flex-wrap items-center gap-3 bg-surface-2/40">
        <span className="grid size-9 place-items-center rounded-full bg-teal-soft text-teal">
          <MessagesSquare size={17} aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-sm text-muted">
          Non trovi la tua domanda? Falla in{" "}
          <Link href="/comunita" className="font-semibold text-teal hover:underline">
            Comunità
          </Link>
          : se è ricorrente, la risposta del Comune diventa una FAQ.
        </p>
      </Card>
    </div>
  );
}
