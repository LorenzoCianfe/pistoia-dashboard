"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { accent } from "@/lib/colors";
import { ANDAMENTO, type Andamento } from "@/lib/cronoprogramma";

/**
 * Cronoprogramma — avanzamento contro calendario, un cantiere per riga.
 *
 * La barra porta il lavoro fatto, il marcatore porta il punto in cui il
 * calendario direbbe di essere oggi, e la banda fra i due è lo scarto. È la
 * lettura che un cittadino cerca e che nessuna percentuale da sola dà: 30% su
 * un cantiere aperto due mesi fa e 30% su uno aperto due anni fa non sono lo
 * stesso 30%.
 *
 * **Costruito in HTML, non in SVG**, e non è pigrizia: le larghezze in
 * percentuale non passano da un `viewBox`, quindi non incontrano lo scalamento
 * non uniforme che ha accorciato le linee del grafico d'andamento (AGENTS.md
 * §3). In più i nomi restano testo vero, si selezionano e crescono in modalità
 * semplice insieme al resto.
 *
 * **L'equivalente testuale è visibile, non nascosto** (DESIGN.md §11.7): ogni
 * riga mostra già nome, percentuale e scarto in parole. Una tabella `sr-only`
 * qui non aggiungerebbe informazione, duplicherebbe quella che c'è — e
 * duplicare significa doverla tenere allineata per sempre.
 */

export type RigaCronoprogramma = {
  id: string;
  nome: string;
  /** Avanzamento 0–1. */
  avanzamento: number;
  /** Quota di calendario consumata, 0–1. */
  tempoConsumato: number;
  andamento: Andamento;
  /** Lo scarto già messo in parole dal server. */
  scarto: string;
  scaduto: boolean;
};

const pct = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format;

export function CronoprogrammaChart({ righe }: { righe: RigaCronoprogramma[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();

  return (
    <ol ref={ref} className="space-y-5">
      {righe.map((r, i) => {
        const tono = ANDAMENTO[r.andamento];
        const { fg, soft } = accent(tono.color);
        const avanti = r.avanzamento * 100;
        const calendario = r.tempoConsumato * 100;
        // La banda dello scarto: da dove sei a dove dovresti essere, in
        // qualunque dei due ordini.
        const bandaDa = Math.min(avanti, calendario);
        const bandaA = Math.max(avanti, calendario);

        return (
          <li key={r.id}>
            <div className="flex items-baseline justify-between gap-3">
              <Link
                href={`/opere/${r.id}`}
                className="truncate text-sm font-medium hover:text-teal"
              >
                {r.nome}
              </Link>
              <span className="shrink-0 font-display text-sm font-semibold tabular-nums">
                {pct(avanti)}%
              </span>
            </div>

            <div
              role="img"
              aria-label={`${r.nome}: ${pct(avanti)} per cento realizzato, il calendario è al ${pct(calendario)} per cento — ${r.scarto}`}
              className="relative mt-2 h-2.5 w-full rounded-pill bg-surface-2"
            >
              {/* La banda dello scarto sta SOTTO la barra piena: è il contesto,
                  non il dato. */}
              <span
                aria-hidden
                className="absolute inset-y-0 rounded-pill"
                style={{
                  left: `${bandaDa}%`,
                  width: `${Math.max(bandaA - bandaDa, 0)}%`,
                  backgroundColor: soft,
                }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-pill bg-[var(--teal)]"
                initial={{ width: reduce ? `${avanti}%` : 0 }}
                animate={inView ? { width: `${avanti}%` } : {}}
                transition={{
                  duration: reduce ? 0 : 0.55,
                  delay: reduce ? 0 : 0.1 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
              {/* Il marcatore del calendario. `translateX(-50%)` più il clamp
                  della posizione lo tengono dentro la pista agli estremi. */}
              <motion.span
                aria-hidden
                className="absolute -top-1 h-[18px] w-[3px] rounded-pill bg-foreground"
                style={{ left: `${Math.min(Math.max(calendario, 1), 99)}%` }}
                initial={reduce ? false : { opacity: 0, scaleY: 0.3 }}
                animate={inView ? { opacity: 1, scaleY: 1 } : {}}
                transition={{
                  duration: reduce ? 0 : 0.3,
                  delay: reduce ? 0 : 0.45 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>

            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span className="font-medium" style={{ color: fg }}>
                {tono.label}
              </span>
              <span className="tabular-nums text-muted-2">· {r.scarto}</span>
              {r.scaduto ? (
                <span className="text-muted-2">· fine prevista già passata</span>
              ) : null}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** Legenda: due righe, perché il marcatore va spiegato una volta sola. */
export function CronoprogrammaLegenda() {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-2">
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="h-2.5 w-6 rounded-pill bg-[var(--teal)]"
        />
        lavoro realizzato
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="h-[14px] w-[3px] rounded-pill bg-foreground" />
        dove dice il calendario
      </span>
    </p>
  );
}
