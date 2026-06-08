import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  hint,
  trend,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] border border-border bg-surface-2/60 p-4",
        className,
      )}
    >
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              trend.direction === "up" && "text-[var(--green)]",
              trend.direction === "down" && "text-[var(--red)]",
              trend.direction === "flat" && "text-muted",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight size={13} />
            ) : trend.direction === "down" ? (
              <ArrowDownRight size={13} />
            ) : null}
            {trend.value}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-2">{hint}</p> : null}
    </div>
  );
}
