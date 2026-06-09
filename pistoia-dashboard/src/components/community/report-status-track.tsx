import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { REPORT_FLOW, reportStatus } from "@/lib/community";
import { cn } from "@/lib/utils";

const TRACK = REPORT_FLOW.filter((s) => s !== "chiusa");

/** Horizontal stepper of the report lifecycle, or a single pill for side states. */
export function ReportStatusTrack({ status }: { status: string }) {
  const meta = reportStatus(status);

  // Side states (duplicata / non_di_competenza) don't sit on the main track.
  if (meta.step === 0) {
    return (
      <div className="flex items-center gap-2">
        <Badge color={meta.color}>{meta.label}</Badge>
        <span className="text-xs text-muted-2">fuori dal flusso standard</span>
      </div>
    );
  }

  const currentStep = status === "chiusa" ? TRACK.length : meta.step;

  return (
    <ol className="flex items-center gap-1.5" aria-label={`Stato: ${meta.label}`}>
      {TRACK.map((s, i) => {
        const stepNo = i + 1;
        const done = stepNo < currentStep;
        const active = stepNo === currentStep;
        const label = reportStatus(s).label;
        return (
          <li key={s} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                  done && "bg-teal text-white",
                  active && "bg-teal-soft text-teal ring-2 ring-teal",
                  !done && !active && "bg-surface-3 text-muted-2",
                )}
              >
                {done ? <Check size={13} strokeWidth={3} /> : stepNo}
              </span>
              {i < TRACK.length - 1 ? (
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    stepNo < currentStep ? "bg-teal" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <span
              className={cn(
                "text-center text-[10px] leading-tight",
                active ? "font-semibold text-foreground" : "text-muted-2",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
