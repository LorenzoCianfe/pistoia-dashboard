"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Sezione narrata dallo scroll (DESIGN.md §6).
 *
 * Una sola per pagina, e solo dove c'è davvero un ragionamento da accompagnare
 * — tipicamente il bilancio: "questi sono i soldi → così entrano → così
 * escono → questo resta". Fuori da quel caso è decorazione, e la decorazione
 * che si muove mentre il cittadino legge è un costo, non un valore.
 *
 * Usa `useScroll` di Motion, l'unica libreria che sposta le animazioni legate
 * allo scroll sulla ScrollTimeline nativa del browser quando disponibile:
 * accelerazione hardware, nessun lavoro sul thread principale a ogni frame.
 *
 * Con `prefers-reduced-motion` la sezione diventa statica e tutti i passaggi
 * restano visibili: si perde la regia, non il contenuto.
 *
 * **La preferenza si legge in CSS, mai in fase di render.** Il server non ha
 * media query: `useReducedMotion()` gli restituisce `null` e al browser che ha
 * la preferenza attiva `true`, quindi qualunque ramo del JSX su quel valore
 * serve un HTML diverso da quello che verrà idratato. Qui costava due errori a
 * ogni caricamento di `/bilancio` — il mismatch di idratazione e, a cascata,
 * «Target ref is defined but not hydrated», perché il ramo statico di
 * `ScrollStep` non montava l'elemento a cui `useScroll` era già agganciato.
 * La regola sta in `globals.css`, accanto a quella di stampa: sono lo stesso
 * problema, cioè una rivelazione che non deve o non può avvenire.
 */

export function ScrollTold({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Lo smorzamento a molla toglie lo scatto dal legame con la rotella.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* `motion-reduce:hidden` e non un ramo del JSX: la barra sparisce con la
          preferenza attiva, ma il markup servito e quello idratato restano lo
          stesso. */}
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-10 h-0.5 w-full overflow-hidden motion-reduce:hidden"
      >
        <motion.div
          className="h-full origin-left bg-[var(--color-accent)]"
          style={{ scaleX: progress }}
        />
      </div>
      {children}
    </div>
  );
}

/**
 * Un passaggio della narrazione. Entra quando raggiunge il centro dello
 * schermo ed esce sfumando: chi legge sa sempre qual è la frase corrente.
 */
export function ScrollStep({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });

  /*
    Il passaggio non scende MAI sotto 0.3, né prima di entrare né dopo essere
    uscito. Partiva da 0, e alla prima pagina che ha usato davvero il componente
    si è visto perché è sbagliato: chi apre la pagina e non scorre — o la
    stampa, o la fotografa — trova un buco al posto di un paragrafo, e
    `DESIGN.md` §11.8 vieta il contenuto invisibile perché un'animazione non è
    partita. Il contrasto fra passaggio attivo e passaggi spenti resta ampio:
    a fare la regia basta il rapporto 1 : 0,3.
  */
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [0.3, 1, 1, 0.45]);
  const y = useTransform(scrollYProgress, [0, 0.25], [24, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      // In stampa l'elemento non entra mai in vista, e con
      // `prefers-reduced-motion` non deve entrarci: la regola su
      // [data-motion-reveal] in globals.css lo riporta fermo e a piena opacità
      // in tutti e due i regimi — ed è ciò che permette a questo `return` di
      // essere l'unico, quindi al `ref` di essere sempre montato e a
      // `useScroll` di trovarlo.
      data-motion-reveal=""
      className={cn("py-10", className)}
    >
      {children}
    </motion.div>
  );
}
