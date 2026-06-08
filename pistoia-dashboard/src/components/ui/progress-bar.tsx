"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { accent } from "@/lib/colors";
import { cn, clamp } from "@/lib/utils";

export function ProgressBar({
  value,
  color,
  gradient = true,
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
