"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { accent } from "@/lib/colors";
import { cn, clamp } from "@/lib/utils";

/**
 * Barra di avanzamento.
 *
 * Non usa `ProgressBar` di Astryx per una ragione precisa: qui l'ingresso è
 * animato con uno stagger legato all'indice (`delay={index * 0.12}` negli
 * elenchi di cantieri), e il componente Astryx non espone né ritardo né
 * animazione d'ingresso. Perderemmo l'orchestrazione per guadagnare nulla.
 *
 * Revisione 2026-07-25: il gradiente teal→viola NON è più il default.
 * DESIGN.md §4 lo riserva a un solo momento per pagina, e con il default
 * attivo ogni cantiere in elenco ne aveva uno — la firma diventava tappezzeria.
 */
export function ProgressBar({
  value,
  color,
  gradient = false,
  delay = 0,
  height = 10,
  className,
  trackClassName,
}: {
  value: number;
  color?: string;
  gradient?: boolean;
  delay?: number;
  height?: number;
  className?: string;
  trackClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  const v = clamp(value);

  const fill = gradient
    ? "linear-gradient(100deg, var(--teal), var(--viola))"
    : accent(color ?? "teal").fg;

  return (
    <div
      ref={ref}
      className={cn(
        "w-full overflow-hidden rounded-pill bg-surface-3",
        trackClassName,
        className,
      )}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-pill"
        style={{ background: fill }}
        initial={{ width: "0%" }}
        animate={inView ? { width: `${v}%` } : {}}
        transition={{
          duration: reduce ? 0 : 1.1,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </div>
  );
}
