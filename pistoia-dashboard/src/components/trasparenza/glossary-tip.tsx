"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { glossaryTerm } from "@/lib/glossary";

/*
  Tooltip del glossario (A2 §27): un termine amministrativo cliccabile che
  apre la definizione in linguaggio semplice, con rimando alla pagina
  /glossario. Pattern disclosure (button + pannello): accessibile da
  tastiera, si chiude con Esc o cliccando fuori.
*/

export function GlossaryTip({
  slug,
  children,
}: {
  slug: string;
  /** Il testo visibile; se assente usa il nome del termine. */
  children?: React.ReactNode;
}) {
  const term = glossaryTerm(slug);
  const panelId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Termine sconosciuto: il testo resta, senza decorazione né errore.
  if (!term) return <>{children ?? slug}</>;

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help rounded-sm underline decoration-dotted decoration-[var(--teal)] underline-offset-[3px] transition-colors hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
      >
        {children ?? term.term}
      </button>
      {open ? (
        <span
          id={panelId}
          role="note"
          className="card absolute left-1/2 top-full z-30 mt-2 block w-72 -translate-x-1/2 p-3.5 text-left shadow-lg"
        >
          <span className="block text-sm font-semibold">{term.term}</span>
          <span className="mt-1 block text-[13px] font-normal leading-relaxed text-muted">
            {term.definition}
          </span>
          <Link
            href="/glossario"
            className="mt-2 inline-block text-xs font-semibold text-teal hover:underline"
            onClick={() => setOpen(false)}
          >
            Tutto il glossario →
          </Link>
        </span>
      ) : null}
    </span>
  );
}
