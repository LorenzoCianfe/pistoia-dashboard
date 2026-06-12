import { accent } from "@/lib/colors";
import { cn } from "@/lib/utils";

/*
  Treemap "squarified" (Bruls et al.) per la spesa per missione (DESIGN.md §8):
  le aree parlano da sole, le etichette vivono dentro le celle quando c'è
  spazio. Componente server puro: nessun JavaScript al client, l'ingresso è
  animato via CSS e rispetta prefers-reduced-motion.
*/

export type TreemapDatum = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type Rect = { x: number; y: number; w: number; h: number };

// Spazio di layout 100×62.5 ≈ aspect-ratio 16/10 del contenitore: i rapporti
// d'aspetto calcolati qui corrispondono a quelli visti a schermo.
const W = 100;
const H = 62.5;

function squarify(values: number[]): Rect[] {
  const total = values.reduce((s, v) => s + v, 0);
  if (total <= 0) return values.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
  const areas = values.map((v) => (v / total) * W * H);
  const rects: Rect[] = new Array(values.length);

  let x = 0;
  let y = 0;
  let w = W;
  let h = H;
  let i = 0;

  while (i < areas.length) {
    // La riga corre lungo il lato corto della regione residua.
    const horizontal = w >= h;
    const side = horizontal ? h : w;

    // Estendi la riga finché il rapporto d'aspetto peggiore migliora.
    let count = 1;
    let sum = areas[i];
    let worst = worstRatio(areas, i, count, sum, side);
    while (i + count < areas.length) {
      const nextSum = sum + areas[i + count];
      const nextWorst = worstRatio(areas, i, count + 1, nextSum, side);
      if (nextWorst > worst) break;
      count += 1;
      sum = nextSum;
      worst = nextWorst;
    }

    // Posiziona le celle della riga.
    const thickness = sum / side;
    let offset = 0;
    for (let k = i; k < i + count; k++) {
      const len = areas[k] / thickness;
      rects[k] = horizontal
        ? { x, y: y + offset, w: thickness, h: len }
        : { x: x + offset, y, w: len, h: thickness };
      offset += len;
    }
    if (horizontal) {
      x += thickness;
      w -= thickness;
    } else {
      y += thickness;
      h -= thickness;
    }
    i += count;
  }
  return rects;
}

function worstRatio(
  areas: number[],
  start: number,
  count: number,
  sum: number,
  side: number,
): number {
  const thickness = sum / side;
  let worst = 0;
  for (let k = start; k < start + count; k++) {
    const len = areas[k] / thickness;
    worst = Math.max(worst, len / thickness, thickness / len);
  }
  return worst;
}

export function Treemap({
  data,
  format,
  ariaLabel,
  className,
}: {
  /** Già ordinati dal più grande al più piccolo. */
  data: TreemapDatum[];
  format: (value: number) => string;
  ariaLabel: string;
  className?: string;
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, d) => s + d.value, 0);
  const rects = squarify(sorted.map((d) => d.value));

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius-sm)]",
        className,
      )}
      style={{ aspectRatio: "16 / 10" }}
    >
      {sorted.map((d, i) => {
        const r = rects[i];
        const tokens = accent(d.color);
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
        // Niente etichette dove non respirano: resta il tooltip nativo.
        const roomy = r.w >= 18 && r.h >= 12;
        return (
          <div
            key={d.id}
            role="listitem"
            aria-label={`${d.label}: ${format(d.value)}, ${pct}% del totale`}
            title={`${d.label} · ${format(d.value)} · ${pct}%`}
            className="absolute overflow-hidden p-2 transition-[filter] duration-150 hover:brightness-[0.97] dark:hover:brightness-110"
            style={{
              left: `${(r.x / W) * 100}%`,
              top: `${(r.y / H) * 100}%`,
              width: `${(r.w / W) * 100}%`,
              height: `${(r.h / H) * 100}%`,
              backgroundColor: tokens.soft,
              boxShadow: "inset 0 0 0 1.5px var(--bg)",
              animation: `rise-in 0.5s var(--ease-out-civic) ${i * 45}ms both`,
            }}
          >
            {roomy ? (
              <div className="flex h-full flex-col justify-between">
                <p className="truncate text-xs font-semibold leading-tight">
                  {d.label}
                </p>
                <p className="leading-tight">
                  <span
                    className="block truncate text-sm font-bold tabular-nums"
                    style={{ color: tokens.fg }}
                  >
                    {format(d.value)}
                  </span>
                  <span className="text-[11px] font-medium text-muted-2 tabular-nums">
                    {pct}%
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
