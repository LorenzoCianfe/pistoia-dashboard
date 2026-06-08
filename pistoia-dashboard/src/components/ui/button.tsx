import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  primary:
    "gradient-teal-viola text-white shadow-[0_10px_24px_-12px_rgba(20,184,166,0.7)] hover:brightness-[1.05] hover:shadow-[0_14px_30px_-12px_rgba(20,184,166,0.8)]",
  secondary:
    "bg-surface border border-border-strong text-foreground hover:bg-surface-2",
  ghost: "text-muted hover:text-foreground hover:bg-surface-2",
  danger:
    "bg-[var(--red-soft)] text-[var(--red)] hover:brightness-95 border border-[color-mix(in_oklab,var(--red)_25%,transparent)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export const buttonClasses = (
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) => cn(base, variants[variant], sizes[size], className);
