import { ProgressBar } from "@/components/ui/progress-bar";
import { PROPOSAL_THRESHOLDS, proposalThreshold } from "@/lib/community";
import { formatNumber } from "@/lib/format";

const NEXT_LABEL: Record<number, string> = {
  [PROPOSAL_THRESHOLDS.highlight]: "verso «in evidenza»",
  [PROPOSAL_THRESHOLDS.official]: "verso la risposta ufficiale",
  [PROPOSAL_THRESHOLDS.consultation]: "verso la consultazione pubblica",
};

export function ThresholdBar({ supports }: { supports: number }) {
  const { next } = proposalThreshold(supports);
  const pct = next ? Math.min(100, Math.round((supports / next) * 100)) : 100;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold tabular-nums">
          {next
            ? `${formatNumber(supports)} / ${formatNumber(next)} sostegni`
            : `${formatNumber(supports)} sostegni`}
        </span>
        <span className="text-muted-2">
          {next ? NEXT_LABEL[next] : "soglia massima raggiunta 🎉"}
        </span>
      </div>
      <ProgressBar value={pct} height={8} />
    </div>
  );
}
