import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { accent as accentTokens, type AccentColor } from "@/lib/colors";

/*
  Empty state "Pistoia geometrica" (DESIGN.md §7): ogni lista vuota dice cosa
  non c'è, perché, e qual è l'azione per riempirla — sotto un'illustrazione
  costruita solo con i motivi identitari (arco romanico, fasce, scacchiera).
*/

function ArcoRomanico({ fg, soft }: { fg: string; soft: string }) {
  return (
    <svg
      width="120"
      height="86"
      viewBox="0 0 120 86"
      aria-hidden="true"
      className="mx-auto"
    >
      {/* La scacchiera dello stemma, piccola e in alto. */}
      <g transform="translate(90 4)">
        <rect width="8" height="8" fill="var(--red)" opacity="0.5" />
        <rect x="8" y="8" width="8" height="8" fill="var(--red)" opacity="0.5" />
        <rect x="8" width="8" height="8" fill="var(--red-soft)" />
        <rect y="8" width="8" height="8" fill="var(--red-soft)" />
      </g>
      {/* L'arco romanico: colonne + volta. */}
      <path
        d="M32 80 V46 A28 28 0 0 1 88 46 V80 Z"
        fill={soft}
        stroke={fg}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Le fasce, dentro l'arco. */}
      <rect x="42" y="58" width="36" height="4" rx="2" fill={fg} opacity="0.3" />
      <rect x="42" y="67" width="36" height="4" rx="2" fill={fg} opacity="0.16" />
      {/* Il basamento. */}
      <line
        x1="20"
        y1="80"
        x2="100"
        y2="80"
        stroke="var(--border-strong)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  action,
  accent = "teal",
  compact = false,
  className,
}: {
  title: string;
  description?: string;
  /** CTA che riempie il vuoto (es. "Segnala un problema"). */
  action?: ReactNode;
  accent?: AccentColor;
  /** Variante senza illustrazione, per spazi stretti (card laterali). */
  compact?: boolean;
  className?: string;
}) {
  const { fg, soft } = accentTokens(accent);
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius)] border border-dashed border-border-strong px-6 text-center",
        compact ? "py-6" : "bande-romaniche py-10",
        className,
      )}
    >
      {compact ? null : <ArcoRomanico fg={fg} soft={soft} />}
      <p className={cn("text-sm font-semibold", compact ? "" : "mt-4")}>
        {title}
      </p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
