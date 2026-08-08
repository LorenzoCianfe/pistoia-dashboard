"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Sankey a colonne — "dove scorrono i soldi" (DESIGN.md §9).
 *
 * Perché scritto a mano e non preso da un registry: `REFERENCES.md` §4 valuta
 * bklit e lo scarta per una ragione strutturale — `npx shadcn add` presuppone
 * shadcn/ui, e questo progetto ha scelto Astryx come strato di primitive.
 * Montare i due sistemi insieme significherebbe due token e due convenzioni di
 * styling sullo stesso schermo. Il sankey resta il grafico giusto per la
 * domanda ("un flusso che si divide"), quindi si porta a mano sui token.
 *
 * Il colore NON distingue le voci: tutti i nastri sono l'accento, e a variare è
 * l'OPACITÀ in funzione della quantità (`DESIGN.md` §9 — rampa sequenziale
 * dall'accento per le quantità, semantica solo per gli stati). Una rampa a
 * opacità si comporta identica nei due temi, mentre una rampa di tinte fisse
 * inverte la leggibilità passando da chiaro a scuro.
 *
 * Accessibilità: tabella equivalente sempre nel DOM, nodi attraversabili con le
 * frecce, annuncio del nodo attivo in live region. Stesso contratto di
 * `DotScatterTimeline`.
 */

/*
  `value` porta la geometria, `display` porta il testo già formattato.
  Sono due campi invece di una funzione `format` perché questo è un componente
  client chiamato da una pagina server: le funzioni non attraversano quel
  confine. Formattare a monte ha anche il vantaggio di tenere le convenzioni
  italiane (`1.234,56 €`) in un posto solo, `@/lib/format`.
*/
export type SankeyNode = {
  id: string;
  label: string;
  value: number;
  display: string;
  /** `flow` segue la rampa dell'accento; gli altri sono stati semantici. */
  tone?: "flow" | "good" | "bad";
};

export type SankeyLink = {
  from: string;
  to: string;
  value: number;
  display: string;
};

type Props = {
  /** Una voce per colonna, da sinistra a destra. */
  columns: SankeyNode[][];
  links: SankeyLink[];
  /** Intestazioni di colonna, in maiuscoletto sopra il diagramma. */
  captions?: string[];
  /** Titolo accessibile: dica la conclusione, non la dimensione. */
  title: string;
  height?: number;
  className?: string;
};

const W = 760;
const NODE_W = 14;
const GAP = 8;
const PAD_TOP = 26;
const PAD_BOTTOM = 6;
/** Spazio a destra riservato alle etichette dell'ultima colonna. */
const LABEL_W = 208;

const TONE_FILL: Record<NonNullable<SankeyNode["tone"]>, string> = {
  flow: "var(--color-accent)",
  good: "var(--color-success)",
  bad: "var(--color-error)",
};

type Placed = SankeyNode & {
  col: number;
  x: number;
  y: number;
  h: number;
  /** Rango per quantità dentro la colonna: pilota l'opacità del nastro. */
  weight: number;
  outUsed: number;
  inUsed: number;
};

export function SankeyFlow({
  columns,
  links,
  captions,
  title,
  height = 420,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);

  const nCols = columns.length;
  const availH = height - PAD_TOP - PAD_BOTTOM;

  // Una sola scala per tutte le colonne: se ogni colonna avesse la propria, un
  // nastro cambierebbe spessore da un capo all'altro e il flusso mentirebbe.
  const colSums = columns.map((c) => c.reduce((a, n) => a + n.value, 0));
  const maxGaps = Math.max(...columns.map((c) => (c.length - 1) * GAP));
  const scale = (availH - maxGaps) / Math.max(...colSums, 1);

  const colX = (i: number) =>
    nCols === 1 ? 0 : ((W - LABEL_W - NODE_W) / (nCols - 1)) * i;

  const placed: Placed[] = [];
  columns.forEach((col, ci) => {
    const colH = col.reduce((a, n) => a + n.value * scale, 0) + (col.length - 1) * GAP;
    const max = Math.max(...col.map((n) => n.value), 1);
    const min = Math.min(...col.map((n) => n.value), 0);
    let y = PAD_TOP + (availH - colH) / 2;
    col.forEach((n) => {
      const h = n.value * scale;
      placed.push({
        ...n,
        col: ci,
        x: colX(ci),
        y,
        h,
        weight: max === min ? 1 : (n.value - min) / (max - min),
        outUsed: 0,
        inUsed: 0,
      });
      y += h + GAP;
    });
  });

  const byId = new Map(placed.map((p) => [p.id, p]));

  // I nastri si accumulano nell'ordine in cui arrivano: le colonne sono già
  // ordinate per importo decrescente, quindi nessun incrocio da districare.
  const ribbons = links.flatMap((l) => {
    const s = byId.get(l.from);
    const t = byId.get(l.to);
    if (!s || !t) return [];
    const th = l.value * scale;
    const y1 = s.y + s.outUsed;
    const y2 = t.y + t.inUsed;
    s.outUsed += th;
    t.inUsed += th;
    const x1 = s.x + NODE_W;
    const x2 = t.x;
    const xm = (x1 + x2) / 2;
    return [
      {
        key: `${l.from}-${l.to}`,
        value: l.value,
        weight: t.weight,
        tone: t.tone ?? "flow",
        d: [
          `M ${x1},${y1}`,
          `C ${xm},${y1} ${xm},${y2} ${x2},${y2}`,
          `L ${x2},${y2 + th}`,
          `C ${xm},${y2 + th} ${xm},${y1 + th} ${x1},${y1 + th}`,
          "Z",
        ].join(" "),
      },
    ];
  });

  const last = nCols - 1;
  const n = placed.length;

  function onKeyDown(e: React.KeyboardEvent) {
    if (n === 0) return;
    const cur = active ?? 0;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(cur + 1, n - 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(cur - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {/*
        Equivalente testuale: gli stessi flussi, in tabella.

        `sr-only` sta sul DIV, non sulla `<table>`, e non è pignoleria: nel
        layout automatico delle tabelle `width: 1px` vale come minimo, non come
        larghezza, quindi una tabella con `sr-only` addosso resta larga quanto
        il suo contenuto — misurata a 1095px — e, essendo in posizione assoluta,
        spinge la pagina in orizzontale. Su un `<div>` la regola stringe davvero
        e la tabella dentro viene ritagliata. La semantica di tabella resta
        intatta, che è il motivo per cui non si tocca il suo `display`.
      */}
      <div className="sr-only">
      <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Da</th>
            <th scope="col">A</th>
            <th scope="col">Importo</th>
          </tr>
        </thead>
        <tbody>
          {links.map((l) => (
            <tr key={`${l.from}-${l.to}`}>
              <th scope="row">{byId.get(l.from)?.label ?? l.from}</th>
              <td>{byId.get(l.to)?.label ?? l.to}</td>
              <td>{l.display}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Sotto i ~640px il diagramma scorre invece di rimpicciolire: a 360px le
          etichette da 11px diventerebbero illeggibili, e un grafico che non si
          legge non è accessibile solo perché è presente. */}
      <div className="-mx-1 overflow-x-auto px-1">
        <div
          role="application"
          aria-label={`${title}. Usa le frecce per scorrere le voci.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          className="min-w-[640px] rounded-[var(--radius-container)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        >
          <svg
            viewBox={`0 0 ${W} ${height}`}
            width="100%"
            height={height}
            role="img"
            aria-label={title}
            // Aggancio per la regola di stampa: senza scroll i nastri non
            // verrebbero mai rivelati e il grafico finirebbe vuoto sul foglio.
            data-motion-reveal=""
          >
            {captions?.map((c, i) => (
              <text
                key={c}
                x={colX(i)}
                y={12}
                fill="var(--muted-2)"
                style={{
                  font: "600 10px var(--font-family-body)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {c.toUpperCase()}
              </text>
            ))}

            {ribbons.map((r, i) => (
              <motion.path
                key={`${uid}-${r.key}`}
                d={r.d}
                fill={TONE_FILL[r.tone]}
                /* `initial` NON si dirama su `reduce`: è markup, e il server
                   non ha media query — servirebbe un HTML diverso da quello
                   idratato. A tenere fermo e visibile il grafico con la
                   preferenza attiva è la regola su [data-motion-reveal] in
                   globals.css, che vale anche quando la rivelazione non parte
                   perché la scheda non è mai stata visibile. La durata invece
                   può diramarsi: non finisce nel DOM servito. */
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 0.28 + r.weight * 0.4 } : {}}
                transition={{
                  duration: reduce ? 0 : 0.5,
                  delay: reduce ? 0 : 0.1 + i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}

            {placed.map((p, i) => {
              const isActive = active === i;
              return (
                <g key={`${uid}-${p.id}`}>
                  <motion.rect
                    x={p.x}
                    y={p.y}
                    width={NODE_W}
                    height={Math.max(p.h, 2)}
                    rx={3}
                    fill={TONE_FILL[p.tone ?? "flow"]}
                    initial={{ opacity: 0, scaleY: 0.2 }}
                    animate={inView ? { opacity: 1, scaleY: 1 } : {}}
                    transition={{
                      duration: reduce ? 0 : 0.45,
                      delay: reduce ? 0 : i * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ transformOrigin: `${p.x}px ${p.y + p.h / 2}px` }}
                  />
                  {/* Bersaglio generoso: la barra è larga 14px, il tocco no. */}
                  <rect
                    x={p.x - 8}
                    y={p.y}
                    width={NODE_W + 16}
                    height={Math.max(p.h, 12)}
                    fill="transparent"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    style={{ cursor: "pointer" }}
                  />

                  {/* Solo l'ultima colonna porta le etichette accanto: a
                      sinistra finirebbero sopra i nastri. Le altre si leggono
                      dall'intestazione di colonna e dall'elenco sotto. */}
                  {p.col === last ? (
                    <g pointerEvents="none">
                      <text
                        x={p.x + NODE_W + 12}
                        y={p.y + p.h / 2 - 2}
                        fill="var(--foreground)"
                        style={{
                          font: `${isActive ? 600 : 500} 12px var(--font-family-body)`,
                        }}
                      >
                        {p.label}
                      </text>
                      <text
                        x={p.x + NODE_W + 12}
                        y={p.y + p.h / 2 + 13}
                        fill="var(--muted)"
                        style={{
                          font: "400 11px var(--font-family-body)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {p.display}
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}

            {/* Etichetta del nodo attivo nelle colonne senza etichetta fissa:
                compare su una piastra, perché sotto ci sono i nastri. */}
            {active != null && placed[active] && placed[active].col !== last ? (
              (() => {
                const p = placed[active];
                const label = `${p.label} · ${p.display}`;
                return (
                  <g pointerEvents="none">
                    <rect
                      x={p.x + NODE_W + 8}
                      y={p.y + p.h / 2 - 13}
                      width={label.length * 6.6 + 16}
                      height={26}
                      rx={13}
                      fill="var(--surface)"
                      stroke="var(--border-strong)"
                    />
                    <text
                      x={p.x + NODE_W + 16}
                      y={p.y + p.h / 2 + 4}
                      fill="var(--foreground)"
                      style={{
                        font: "600 12px var(--font-family-body)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {label}
                    </text>
                  </g>
                );
              })()
            ) : null}
          </svg>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {active != null && placed[active]
          ? `${placed[active].label}: ${placed[active].display}`
          : ""}
      </p>
    </div>
  );
}
