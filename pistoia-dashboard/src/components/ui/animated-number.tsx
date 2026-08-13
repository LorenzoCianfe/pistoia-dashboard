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
  onAssestato,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
  /**
   * Chiamata **una volta sola**, quando la cifra ha finito di contare, col
   * valore già formattato.
   *
   * Serve a chi ascolta: il conteggio muta `textContent` fotogramma per
   * fotogramma, quindi un lettore di schermo che arrivi mentre l'animazione
   * gira legge un numero intermedio e non ha modo di sapere che non è quello
   * definitivo (P24 di `docs/ricognizione-visiva.md` — un buco nostro, trovato
   * guardando com'è fatto il contatore di qualcun altro).
   *
   * Chi la usa decide che farne. `DisplayNumber` ci appende una live region
   * che annuncia il valore assestato; gli altri usi non cambiano.
   */
  onAssestato?: (testo: string) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  const reduce = useReducedMotion();
  // In un ref e non fra le dipendenze dell'effetto che anima: una funzione
  // ridefinita a ogni render del genitore rilancerebbe il conteggio da zero a
  // ogni giro. Il ref si aggiorna in un effetto e non durante il render —
  // scrivere un ref mentre si renderizza è proprio ciò che `react-hooks/refs`
  // vieta, e questo effetto è dichiarato PRIMA di quello che anima, quindi al
  // montaggio il valore è già a posto.
  const assestato = useRef(onAssestato);
  useEffect(() => {
    assestato.current = onAssestato;
  }, [onAssestato]);

  useMotionValueEvent(mv, "change", (latest) => {
    if (ref.current) ref.current.textContent = format(latest);
  });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(value);
      assestato.current?.(format(value));
      return;
    }
    const controls = animate(mv, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => assestato.current?.(format(value)),
    });
    return () => controls.stop();
    // `format` è escluso: è ricreato a ogni render da chi ci passa delle
    // opzioni di `Intl`, e includerlo rilancerebbe il conteggio da zero
    // ogni volta che il genitore si ridisegna.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, duration, delay, reduce, mv]);

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  );
}
