import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  error: {
    color: "var(--red)",
    bg: "var(--red-soft)",
    Icon: AlertCircle,
  },
  success: {
    color: "var(--green)",
    bg: "var(--green-soft)",
    Icon: CheckCircle2,
  },
  info: {
    color: "var(--teal)",
    bg: "var(--teal-soft)",
    Icon: Info,
  },
} as const;

export function Alert({
  children,
  variant = "error",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof styles;
  className?: string;
}) {
  const { color, bg, Icon } = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--radius-sm)] px-3.5 py-3 text-sm font-medium",
        className,
      )}
      style={{ color, backgroundColor: bg }}
    >
      <Icon size={18} className="mt-px shrink-0" />
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}
