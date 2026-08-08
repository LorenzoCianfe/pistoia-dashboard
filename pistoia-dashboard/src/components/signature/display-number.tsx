"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";

/**
 * Cifra display — il numero protagonista di una schermata (DESIGN.md §7).
 *
 * Sostituisce la cifra a matrice di punti (revisione 2026-07-25). Il principio
 * è cambiato: la memorabilità viene dalla **scala** e dal contrasto con la
 * label minuscola, non da un espediente grafico. Il numero è testo vero —
 * selezionabile, cercabile, copiabile, leggibile da qualunque tecnologia
 * assistiva, senza equivalenti nascosti da mantenere.
 *
 * Regola invariata: **una sola cifra display per schermata**. Se ce ne sono
 * due, nessuna delle due è protagonista.
 *
 * Il corredo (unità, scala a tacche, delta, sparkline) è tutto opzionale e va
 * aggiunto solo quando dice qualcosa. Un numero circondato da quattro
 * decorazioni non è più leggibile di uno nudo: è solo più affollato.
 */

export type DisplayNumberProps = {
  /** Il valore. Numerico, così può contare da zero. */
  value: number;
  /**
   * Opzioni di formattazione del valore (default: it-IT, zero decimali).
   *
   * È un OGGETTO e non una funzione di proposito. Questo è un componente
   * client, e le pagine che gli danno la cifra protagonista sono tutte Server
   * Component: una funzione non attraversa quel confine, React la rifiuta a
   * runtime con «Functions cannot be passed directly to Client Components».
   * Il typecheck non lo vede e nemmeno il lint — si scopre aprendo la pagina,
   * che va sull'error boundary. Un oggetto di opzioni è serializzabile e passa.
   */
  formatOptions?: Intl.NumberFormatOptions;
  /** Unità, resa piccola accanto alla cifra: "mln €", "%", "su 100". */
  unit?: string;
  /** Etichetta sopra, in maiuscoletto spaziato. */
  label?: string;
  /**
   * Scala a tacche sotto la cifra: mostra dove cade il valore in un intervallo
   * noto (es. il minimo e il massimo storici). Omettila se l'intervallo non ha
   * un significato reale — una scala inventata è peggio di nessuna scala.
   */
  scale?: { min: number; max: number; label?: string };
  /** Variazione nel periodo: "↗ +3,2 negli ultimi 30 giorni". */
  delta?: { value: number; period: string; format?: (n: number) => string };
  /** Micro-andamento accanto alla cifra. */
  sparkline?: React.ReactNode;
  /**
   * `hero` è la cifra protagonista della pagina (una sola).
   * `md` serve dentro una card di stato o sopra una superficie mesh, dove la
   * scala hero schiaccerebbe tutto il resto.
   */
  size?: "hero" | "md";
  className?: string;
};

const deltaFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
  signDisplay: "always",
}).format;

const TICKS = 24;

export function DisplayNumber({
  value,
  formatOptions,
  unit,
  label,
  scale,
  delta,
  sparkline,
  size = "hero",
  className,
}: DisplayNumberProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const format = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
    ...formatOptions,
  }).format;

  // Posizione del valore nella scala, come indice di tacca.
  const activeTick =
    scale && scale.max > scale.min
      ? Math.round(
          ((Math.min(Math.max(value, scale.min), scale.max) - scale.min) /
            (scale.max - scale.min)) *
            (TICKS - 1),
        )
      : null;

  const rising = delta ? delta.value >= 0 : false;

  return (
    <div
      ref={ref}
      data-size={size}
      className={cn("display-number", className)}
    >
      {label ? (
        <p className="display-number__label">{label}</p>
      ) : null}

      <div className="display-number__row">
        <span className="display-number__value">
          <AnimatedNumber value={value} format={format} duration={0.88} />
        </span>
        {unit ? <span className="display-number__unit">{unit}</span> : null}
        {sparkline ? (
          <span className="display-number__spark">{sparkline}</span>
        ) : null}
      </div>

      {scale ? (
        <div
          className="display-number__scale"
          role="img"
          aria-label={
            scale.label ??
            `${format(value)} in un intervallo da ${format(scale.min)} a ${format(scale.max)}`
          }
        >
          {Array.from({ length: TICKS }, (_, i) => (
            <motion.span
              key={i}
              className="display-number__tick"
              data-active={i === activeTick ? "" : undefined}
              /* Costante di proposito: `initial` è markup, e un ramo su
                 `reduce` fa divergere l'HTML servito da quello idratato — il
                 server non ha media query. La preferenza la porta la durata. */
              initial={{ opacity: 0, scaleY: 0.4 }}
              animate={inView ? { opacity: 1, scaleY: 1 } : {}}
              transition={{
                duration: reduce ? 0 : 0.3,
                delay: reduce ? 0 : 0.35 + i * 0.012,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </div>
      ) : null}

      {delta ? (
        <p className="display-number__delta" data-rising={rising ? "" : undefined}>
          <span aria-hidden="true">{rising ? "↗" : "↘"}</span>{" "}
          {(delta.format ?? deltaFormat)(delta.value)}{" "}
          <span className="display-number__period">{delta.period}</span>
        </p>
      ) : null}
    </div>
  );
}
