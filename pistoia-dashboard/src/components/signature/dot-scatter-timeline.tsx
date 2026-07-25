"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Timeline a punti sparsi — il grafico distintivo dei riferimenti in `refs/`
 * (DESIGN.md §8).
 *
 * Ogni punto è un evento nel tempo: la POSIZIONE verticale porta il valore, il
 * DIAMETRO porta l'intensità, il colore porta lo stato. Adatto ad "attività nel
 * tempo" — segnalazioni per settimana, tappe dei cantieri — dove una spezzata
 * suggerirebbe una continuità che nei dati non c'è.
 *
 * Accessibilità (DESIGN.md §10): i punti sono attraversabili da tastiera con le
 * frecce, ogni punto ha un nome accessibile, ed esiste sempre la tabella
 * equivalente. Un grafico che si può solo guardare qui non è ammesso.
 *
 * Nessuna dipendenza oltre a Motion, già in progetto.
 */

export type ScatterPoint = {
  /** Etichetta del periodo (es. "12 mar"). */
  label: string;
  /** Valore: determina l'altezza. */
  value: number;
  /** Intensità 0–1: determina il diametro. Default 0.5. */
  weight?: number;
  /** Stato semantico: determina il colore. */
  status?: "neutral" | "good" | "warn" | "bad" | "highlight";
};

const STATUS_FILL: Record<NonNullable<ScatterPoint["status"]>, string> = {
  neutral: "var(--color-data-neutral)",
  good: "var(--color-success)",
  warn: "var(--amber)",
  bad: "var(--color-error)",
  highlight: "var(--highlight)",
};

const W = 720;

export function DotScatterTimeline({
  points,
  height = 132,
  title,
  caption,
  formatValue = (v) => new Intl.NumberFormat("it-IT").format(v),
  className,
}: {
  points: ScatterPoint[];
  height?: number;
  /** Titolo accessibile: dica la conclusione, non la dimensione (DESIGN.md §8). */
  title: string;
  caption?: string;
  formatValue?: (v: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);

  const padX = 16;
  const padY = 18;
  const n = points.length;
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;

  const stepX = (W - padX * 2) / Math.max(n - 1, 1);
  const xy = (p: ScatterPoint, i: number): [number, number] => [
    padX + i * stepX,
    padY + (1 - (p.value - min) / span) * (height - padY * 2),
  ];

  // Le frecce spostano la selezione: è l'equivalente da tastiera del passare
  // il mouse sui punti.
  function onKeyDown(e: React.KeyboardEvent) {
    if (n === 0) return;
    const cur = active ?? 0;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(cur + 1, n - 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(cur - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {/* Equivalente testuale: gli stessi dati, in tabella. `sr-only` sta sul
          DIV perché su una `<table>` non stringe — vedi la nota estesa in
          `charts/sankey-flow.tsx`. */}
      <div className="sr-only">
      <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Periodo</th>
            <th scope="col">Valore</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={`${p.label}-${i}`}>
              <th scope="row">{p.label}</th>
              <td>{formatValue(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div
        role="application"
        aria-label={`${title}. Usa le frecce per scorrere i punti.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        className="rounded-[var(--radius-container)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
      >
        <svg
          viewBox={`0 0 ${W} ${height}`}
          width="100%"
          height={height}
          role="img"
          aria-label={title}
          className="overflow-visible"
          // Aggancio per la regola di stampa: senza scroll i punti non
          // verrebbero mai rivelati e il grafico finirebbe vuoto sul foglio.
          data-motion-reveal=""
        >
          {/* Linea di base: riferimento discreto, non una griglia. */}
          <line
            x1={padX}
            x2={W - padX}
            y1={height - padY / 2}
            y2={height - padY / 2}
            stroke="var(--border)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          {points.map((p, i) => {
            const [cx, cy] = xy(p, i);
            const w = p.weight ?? 0.5;
            const r = 3 + w * 7;
            const isActive = active === i;
            return (
              <g key={`${uid}-${i}`}>
                {/* Bersaglio invisibile: ≥44px equivalenti per il tocco. */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={Math.max(r + 10, 16)}
                  fill="transparent"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  style={{ cursor: "pointer" }}
                />
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={STATUS_FILL[p.status ?? "neutral"]}
                  initial={reduce ? false : { opacity: 0, scale: 0.3 }}
                  animate={
                    inView
                      ? { opacity: isActive ? 1 : 0.85, scale: isActive ? 1.35 : 1 }
                      : {}
                  }
                  transition={{
                    duration: reduce ? 0 : 0.4,
                    delay: reduce ? 0 : i * 0.025,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              </g>
            );
          })}

          {/* Etichetta del punto attivo, ancorata al punto. */}
          {active != null && points[active] ? (
            (() => {
              const [cx, cy] = xy(points[active], active);
              const flip = cx > W - 120;
              return (
                <g pointerEvents="none">
                  <text
                    x={flip ? cx - 12 : cx + 12}
                    y={cy - 12}
                    textAnchor={flip ? "end" : "start"}
                    fill="var(--foreground)"
                    style={{ font: "600 13px var(--font-family-body)" }}
                  >
                    {formatValue(points[active].value)}
                  </text>
                  <text
                    x={flip ? cx - 12 : cx + 12}
                    y={cy + 4}
                    textAnchor={flip ? "end" : "start"}
                    fill="var(--muted)"
                    style={{ font: "400 11px var(--font-family-body)" }}
                  >
                    {points[active].label}
                  </text>
                </g>
              );
            })()
          ) : null}
        </svg>
      </div>

      {caption ? (
        <p className="mt-2 text-[11px] text-muted-2">{caption}</p>
      ) : null}

      {/* Annuncio del punto selezionato per gli screen reader. */}
      <p aria-live="polite" className="sr-only">
        {active != null && points[active]
          ? `${points[active].label}: ${formatValue(points[active].value)}`
          : ""}
      </p>
    </div>
  );
}
