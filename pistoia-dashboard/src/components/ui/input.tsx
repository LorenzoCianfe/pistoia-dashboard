import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  invalid,
  ...props
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[var(--radius-sm)] border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted-2 transition-colors",
        "focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]",
        invalid ? "border-[var(--red)]" : "border-border-strong",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string | string[];
  hint?: ReactNode;
  children: ReactNode;
}) {
  const errText = Array.isArray(error) ? error[0] : error;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {hint}
      </div>
      {children}
      {errText ? (
        <p className="text-xs font-medium text-[var(--red)]">{errText}</p>
      ) : null}
    </div>
  );
}
