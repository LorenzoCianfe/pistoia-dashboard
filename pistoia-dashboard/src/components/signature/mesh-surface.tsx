import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Superficie a gradiente mesh con grana — la card-firma dei riferimenti
 * (DESIGN.md §8).
 *
 * La regola che la rende difendibile su una piattaforma pubblica: **la tinta
 * codifica un dato**. Non si sceglie "quella verde perché sta bene"; si passa
 * un tono semantico e il colore segue il valore. Un ente pubblico non può
 * permettersi un colore che sembra dire qualcosa e non dice niente.
 *
 * Nessuna dipendenza: gradienti radiali CSS più una turbolenza SVG inline
 * (token `--grain-url`). Nessun WebGL, nessuna texture da scaricare.
 */

export type MeshTone = "good" | "warn" | "bad" | "cool";

/** Deriva il tono da una percentuale di avanzamento/salute (0–100). */
export function toneFromPercent(pct: number): MeshTone {
  if (pct >= 70) return "good";
  if (pct >= 40) return "warn";
  return "bad";
}

export function MeshSurface({
  tone = "cool",
  children,
  className,
  as: Tag = "div",
}: {
  /**
   * Tono semantico. `cool` è il neutro: da usare quando la superficie NON
   * rappresenta una salute (es. una card di navigazione), così il verde non
   * viene letto come "va tutto bene" per caso.
   */
  tone?: MeshTone;
  children?: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn("mesh-surface", className)}
      data-tone={tone}
      style={
        {
          "--mesh-a": `var(--mesh-${tone}-a)`,
          "--mesh-b": `var(--mesh-${tone}-b)`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
