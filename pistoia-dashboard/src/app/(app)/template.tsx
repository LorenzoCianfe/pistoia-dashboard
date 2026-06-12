"use client";

import { ViewTransition } from "react";
import { motion, useReducedMotion } from "motion/react";

// A `template` re-mounts on every navigation, so each section animates in with
// a gentle upward slide + fade — the native-app feel from the concept.
// <ViewTransition> aggiunge il cross-fade del browser tra pagina vecchia e
// nuova durante la navigazione (DESIGN.md §6).
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <ViewTransition>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        // L'animazione può completarsi prima dell'hydration: lo style inline
        // server (stato iniziale) non coinciderebbe più. Mismatch atteso e voluto.
        suppressHydrationWarning
      >
        {children}
      </motion.div>
    </ViewTransition>
  );
}
