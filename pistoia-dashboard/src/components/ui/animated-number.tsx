"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toString(),
  duration = 1.4,
  delay = 0,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  const reduce = useReducedMotion();

  useMotionValueEvent(mv, "change", (latest) => {
    if (ref.current) ref.current.textContent = format(latest);
  });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, value, duration, delay, reduce, mv]);

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  );
}
