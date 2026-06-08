import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 16,
  className,
  showValue = false,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="relative inline-block"
        style={{ width: size * 5 + 8, height: size }}
        aria-label={`${value.toFixed(1)} su 5`}
      >
        {/* track */}
        <span className="absolute inset-0 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} className="text-border-strong" />
          ))}
        </span>
        {/* fill, clipped to percentage */}
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={size}
              className="shrink-0 fill-[var(--amber)] text-[var(--amber)]"
            />
          ))}
        </span>
      </span>
      {showValue ? (
        <span className="text-sm font-semibold tabular-nums">
          {value.toFixed(1).replace(".", ",")}
        </span>
      ) : null}
    </span>
  );
}
