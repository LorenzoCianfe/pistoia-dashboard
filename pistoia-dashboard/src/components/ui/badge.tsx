import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { accent } from "@/lib/colors";

export function Badge({
  color = "teal",
  soft = true,
  className,
  style,
  ...props
}: ComponentProps<"span"> & { color?: string; soft?: boolean }) {
  const { fg, soft: softBg } = accent(color);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold",
        className,
      )}
      style={{
        color: fg,
        backgroundColor: soft ? softBg : "transparent",
        ...style,
      }}
      {...props}
    />
  );
}

/** Small amber "anteprima" pill used in the top bar. */
export function PreviewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-semibold",
        className,
      )}
      style={{ color: "var(--amber)", backgroundColor: "var(--amber-soft)" }}
    >
      <span className="size-1.5 rounded-full bg-[var(--amber)]" />
      Anteprima
    </span>
  );
}
