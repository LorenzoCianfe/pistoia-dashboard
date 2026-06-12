import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex items-center gap-2.5">
          {icon ? <span className="text-teal">{icon}</span> : null}
          <h1 className="font-display text-[26px] font-semibold tracking-tight sm:text-[30px]">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
