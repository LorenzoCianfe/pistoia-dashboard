import { ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IMPACT_SCALE,
  COST_SCALE,
  TIME_SCALE,
  FEASIBILITY_SCALE,
  hasAssessment,
  type ProposalAssessment,
} from "@/lib/civic-topics";
import { formatDate } from "@/lib/format";

// Valutazione sintetica del Comune (A1 §15 + A2 §10): badge leggibili con
// disclaimer esplicito — integra la valutazione tecnica, non la sostituisce.

export function ProposalAssessmentCard({
  assessment,
}: {
  assessment: ProposalAssessment;
}) {
  if (!hasAssessment(assessment)) return null;

  const impact = assessment.estimatedImpact
    ? IMPACT_SCALE[assessment.estimatedImpact]
    : null;
  const cost = assessment.estimatedCost ? COST_SCALE[assessment.estimatedCost] : null;
  const time = assessment.estimatedTime ? TIME_SCALE[assessment.estimatedTime] : null;
  const feas = assessment.feasibility
    ? FEASIBILITY_SCALE[assessment.feasibility]
    : null;

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ClipboardCheck size={18} className="text-teal" />
          Valutazione sintetica del Comune
        </h2>
        {assessment.assessedAt ? (
          <span className="text-xs text-muted-2" suppressHydrationWarning>
            {formatDate(assessment.assessedAt)}
          </span>
        ) : null}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {impact ? (
          <div>
            <dt className="text-[11px] text-muted-2">Impatto sui cittadini</dt>
            <dd className="mt-1">
              <Badge color={impact.color}>{impact.label}</Badge>
            </dd>
          </div>
        ) : null}
        {cost ? (
          <div>
            <dt className="text-[11px] text-muted-2">Costo stimato</dt>
            <dd className="mt-1">
              <Badge color={cost.color}>
                <span className="tabular-nums">{cost.symbol}</span> {cost.label}
              </Badge>
            </dd>
          </div>
        ) : null}
        {time ? (
          <div>
            <dt className="text-[11px] text-muted-2">Tempo stimato</dt>
            <dd className="mt-1">
              <Badge color={time.color}>{time.label}</Badge>
            </dd>
          </div>
        ) : null}
        {feas ? (
          <div>
            <dt className="text-[11px] text-muted-2">Fattibilità</dt>
            <dd className="mt-1">
              <Badge color={feas.color}>{feas.label}</Badge>
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-2">
        Valutazione indicativa: aiuta a capire la complessità dell&apos;intervento,
        non sostituisce la valutazione tecnica degli uffici.
      </p>
    </Card>
  );
}

/** Riga compatta per le card elenco: "€€ · Impatto alto". */
export function AssessmentInline({
  assessment,
}: {
  assessment: ProposalAssessment;
}) {
  if (!hasAssessment(assessment)) return null;
  const parts: string[] = [];
  if (assessment.estimatedCost && COST_SCALE[assessment.estimatedCost]) {
    parts.push(COST_SCALE[assessment.estimatedCost].symbol);
  }
  if (assessment.estimatedImpact && IMPACT_SCALE[assessment.estimatedImpact]) {
    parts.push(`Impatto ${IMPACT_SCALE[assessment.estimatedImpact].label.toLowerCase()}`);
  }
  if (parts.length === 0) return null;
  return (
    <span className="text-xs font-medium text-muted-2" title="Valutazione sintetica del Comune">
      {parts.join(" · ")}
    </span>
  );
}
