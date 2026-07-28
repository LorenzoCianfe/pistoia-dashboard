import type { Metadata } from "next";
import Link from "next/link";
import { Landmark, ArrowRight, CircleSlash } from "lucide-react";
import { getDecisions } from "@/lib/data/transparency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SimpleExplainer } from "@/components/trasparenza/simple-explainer";
import { DisplayNumber } from "@/components/signature/display-number";
import { decisionOutcome, decisionKind } from "@/lib/transparency";
import { formatDate, formatNumber } from "@/lib/format";

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
  const respinte = decisions.filter((d) => d.outcome === "respinta").length;
  const daPartecipazione = decisions.filter(
    (d) => d.kind === "proposta" || d.kind === "consultazione" || d.kind === "segnalazione",
  ).length;

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Archivio decisioni"
        description="Cosa succede dopo la partecipazione: ogni proposta, consultazione o segnalazione importante arriva a una decisione — e la decisione ha sempre un motivo."
        icon={<Landmark size={26} />}
      />

      {/*
        L'apertura. La cifra è nuda — nessuna scala a tacche — per la ragione
        già scritta su /proposte: un totale non ha un massimo reale a cui
        rapportarsi, e una scala inventata è peggio di nessuna scala
        (DESIGN.md §8).

        Il numero protagonista è quanto è GRANDE l'archivio, non quante
        decisioni sono state approvate. Il tasso di approvazione sembra la
        misura ovvia e non lo è: dice quanto l'amministrazione asseconda, non
        quanto rende conto — e questa pagina esiste per la seconda cosa. Le
        respinte compaiono nella frase sotto perché sono la prova del contrario,
        non l'eccezione da nascondere: ognuna porta il suo «perché non si può
        fare».
      */}
      {decisions.length > 0 ? (
        <Card>
          <DisplayNumber
            value={decisions.length}
            unit={decisions.length === 1 ? "decisione" : "decisioni"}
            label="Pubblicate con la loro motivazione"
          />
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            {daPartecipazione > 0 ? (
              <>
                {formatNumber(daPartecipazione)}{" "}
                {daPartecipazione === 1 ? "nasce" : "nascono"} da una proposta,
                una consultazione o una segnalazione dei cittadini
                {respinte > 0 ? " · " : ". "}
              </>
            ) : null}
            {respinte > 0 ? (
              <>
                {formatNumber(respinte)}{" "}
                {respinte === 1 ? "ha avuto esito negativo" : "hanno avuto esito negativo"},
                e {respinte === 1 ? "spiega" : "spiegano"} perché non si poteva
                fare.
              </>
            ) : null}
          </p>
        </Card>
      ) : null}

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
