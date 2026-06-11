"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { accent } from "@/lib/colors";
import { clamp } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

export function RingGauge({
  value,
  color = "teal",
  label,
  size = 132,
  strokeWidth = 12,
  delay = 0,
  suffix = "%",
}: {
  value: number;
  color?: string;
  label?: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const v = clamp(value);

  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v / 100);
  const { fg } = accent(color);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2"
      style={{ width: size }}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${label ?? "Indicatore"}: ${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v)}${suffix}`}
      >
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={fg}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={inView ? { strokeDashoffset: reduce ? offset : offset } : {}}
            transition={{
              duration: reduce ? 0 : 1.5,
              delay,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </svg>
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            <AnimatedNumber value={v} delay={delay} />
            <span className="text-base font-medium text-muted">{suffix}</span>
          </span>
        </div>
      </div>
      {label ? (
        // aria-hidden: l'etichetta è già nell'accessible name del role="img";
        // lasciarla visibile allo SR la farebbe leggere due volte.
        <span
          aria-hidden="true"
          className="text-center text-xs font-medium text-muted leading-tight"
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
