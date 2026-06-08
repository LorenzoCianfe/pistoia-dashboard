"use client";

import { useId, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { accent } from "@/lib/colors";

export type Series = {
  name: string;
  color: string; // accent token
  points: number[];
};

const W = 640;

function smoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]},${pts[0][1]}`;
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  const t = 0.18;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function LineChart({
  series,
  labels,
  height = 220,
}: {
  series: Series[];
  labels: string[];
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  const uid = useId().replace(/[:]/g, "");

  const padX = 8;
  const padTop = 16;
  const padBottom = 12;
  const all = series.flatMap((s) => s.points);
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const span = max - min || 1;

  const n = labels.length;
  const stepX = (W - padX * 2) / Math.max(n - 1, 1);

  const toXY = (val: number, i: number): [number, number] => [
    padX + i * stepX,
    padTop + (1 - (val - min) / span) * (height - padTop - padBottom),
  ];

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          {series.map((s) => {
            const { fg } = accent(s.color);
            return (
              <linearGradient
                key={s.name}
                id={`area-${uid}-${s.name}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={fg} stopOpacity={0.18} />
                <stop offset="100%" stopColor={fg} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>

        {/* horizontal guide lines */}
        {[0, 0.5, 1].map((g) => {
          const y = padTop + g * (height - padTop - padBottom);
          return (
            <line
              key={g}
              x1={padX}
              x2={W - padX}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {series.map((s, si) => {
          const pts = s.points.map((v, i) => toXY(v, i));
          const line = smoothPath(pts);
          const area =
            line +
            ` L ${pts[pts.length - 1][0]},${height - padBottom}` +
            ` L ${pts[0][0]},${height - padBottom} Z`;
          const { fg } = accent(s.color);
          return (
            <g key={s.name}>
              <motion.path
                d={area}
                fill={`url(#area-${uid}-${s.name})`}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 + si * 0.15 }}
              />
              <motion.path
                d={line}
                fill="none"
                stroke={fg}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{
                  duration: reduce ? 0 : 1.6,
                  delay: si * 0.15,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}

      </svg>
      {/* x-axis labels rendered as HTML so they never stretch with the chart */}
      <div className="mt-1 flex justify-between px-1 text-[11px] text-muted-2">
        {labels.map((lab, i) => {
          const show = n <= 8 || i % 2 === 0 || i === n - 1;
          return (
            <span key={lab + i} className={show ? "" : "opacity-0"}>
              {lab}
            </span>
          );
        })}
      </div>
    </div>
  );
}
