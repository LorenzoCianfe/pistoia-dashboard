import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Le stelle si riempiono con l'**accento**, non con l'ambra (cambiato il
  2026-08-03, quando le valutazioni sono diventate vere).

  Due ragioni, e la prima è di sistema: in `DESIGN.md` §4 `--amber` significa
  «attenzione e attesa» — è il colore di «in valutazione» e degli avvisi non
  critici. Una fila di cinque stelle ambra su una scheda che dice «4,1» usa il
  colore dell'allarme per dire che va bene, e il significato dei token qui non
  è negoziabile.

  La seconda è di carattere: la fila di stelle gialle è l'elemento più
  riconoscibilmente da template dell'intero web, ed è esattamente il caso in
  cui `DESIGN.md` §1 dice di ridisegnare. `--color-accent` è «azione e vita»,
  cioè il colore dei dati che crescono: è il ruolo giusto.

  Il valore resta scritto accanto: lo stato non si comunica mai col solo
  colore (`DESIGN.md` §11, 3).
*/
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
              className="shrink-0 fill-[var(--color-accent)] text-[var(--color-accent)]"
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
