import type { Metadata } from "next";
import Link from "next/link";
import { Landmark, ArrowRight, CircleSlash } from "lucide-react";
import { getDecisions } from "@/lib/data/transparency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SimpleExplainer } from "@/components/trasparenza/simple-explainer";
import { decisionOutcome, decisionKind } from "@/lib/transparency";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Archivio decisioni",
  description:
    "Cosa ha deciso il Comune dopo proposte, consultazioni e segnalazioni — con il motivo, in parole semplici.",
};

/*
  Archivio decisioni (A1 §12, O3): la pagina che chiude il cerchio della
  partecipazione. Ogni scheda dice cosa è stato deciso, perché, e — quando
  l'esito è negativo — "perché non si può fare" (A1 §13).
*/

export default async function DecisioniPage() {
  const decisions = await getDecisions();

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Archivio decisioni"
        description="Cosa succede dopo la partecipazione: ogni proposta, consultazione o segnalazione importante arriva a una decisione — e la decisione ha sempre un motivo."
        icon={<Landmark size={26} />}
      />

      {decisions.length === 0 ? (
        <EmptyState
          title="Ancora nessuna decisione in archivio"
          description="Quando il Comune deciderà su proposte e consultazioni, qui troverai esito e motivazione."
        />
      ) : (
        <div className="space-y-4 stagger">
          {decisions.map((d) => {
            const outcome = decisionOutcome(d.outcome);
            const negative = d.outcome === "respinta";
            return (
              <Card key={d.id} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={outcome.color}>{outcome.label}</Badge>
                  <span className="text-xs text-muted-2">
                    {decisionKind(d.kind)}
                    {d.department ? ` · ${d.department}` : ""}
                  </span>
                  <span className="ml-auto text-xs text-muted-2" suppressHydrationWarning>
                    {formatDate(d.decidedAt)}
                  </span>
                </div>

                <h2 className="text-lg font-bold tracking-tight">{d.title}</h2>
                <p className="text-sm leading-relaxed text-foreground/90">{d.summary}</p>

                <div
                  className={
                    negative
                      ? "rounded-[var(--radius-sm)] border border-[var(--red)]/20 bg-red-soft/40 p-3.5"
                      : "rounded-[var(--radius-sm)] border border-border bg-surface-2/50 p-3.5"
                  }
                >
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                    {negative ? <CircleSlash size={13} aria-hidden /> : null}
                    {negative ? "Perché non si può fare" : "Il motivo"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">{d.reason}</p>
                </div>

                {d.simpleText ? <SimpleExplainer text={d.simpleText} /> : null}

                {d.href ? (
                  <Link
                    href={d.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
                  >
                    Vai al percorso completo
                    <ArrowRight size={15} aria-hidden />
                  </Link>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          Le decisioni mostrate sono <strong>dati dimostrativi</strong>: in una
          versione reale questa pagina sarebbe alimentata da delibere e
          determine dell&apos;albo pretorio, con link agli atti originali.
        </p>
      </Card>
    </div>
  );
}
