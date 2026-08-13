import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { accent as accentTokens, type AccentColor } from "@/lib/colors";

/*
  Empty state "Pistoia geometrica" (DESIGN.md §7): ogni lista vuota dice cosa
  non c'è, perché, e qual è l'azione per riempirla — sotto un'illustrazione
  costruita solo con i motivi identitari (arco romanico, fasce romaniche).
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
      {/* Le fasce romaniche, piccole e in alto. Qui c'era la **scacchiera**
          dello stemma, uscita col battesimo del 2026-08-12: l'araldica
          dell'ente non firma una piattaforma che l'ente non è (DESIGN.md §3).
          Le fasce di San Giovanni Fuorcivitas restano — sono patrimonio della
          città, non insegna dell'amministrazione. */}
      <g transform="translate(88 5)">
        <rect width="18" height="4" fill="var(--red)" opacity="0.45" />
        <rect y="6" width="18" height="4" fill="var(--red-soft)" />
        <rect y="12" width="18" height="4" fill="var(--red)" opacity="0.45" />
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
