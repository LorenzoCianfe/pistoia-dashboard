"use client";

import { motion, useReducedMotion } from "motion/react";

// A `template` re-mounts on every navigation, so each section animates in with
// a gentle upward slide + fade — the native-app feel from the concept.
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
