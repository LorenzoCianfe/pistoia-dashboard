"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Visibile in console; in produzione arriva anche a onRequestError
    // (instrumentation.ts) lato server.
    console.error(error);
  }, [error]);

  // Sposta il focus sull'intestazione: senza, lo screen reader non si accorge
  // che il contenuto è stato sostituito dal boundary (WCAG 4.1.3 / 2.4.3).
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-soft text-[var(--red)]">
          <TriangleAlert size={22} aria-hidden />
        </span>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 text-xl font-semibold tracking-tight outline-none"
        >
          Qualcosa è andato storto
        </h1>
        <p className="mt-2 text-sm text-muted">
          Un errore imprevisto ha interrotto questa sezione. I tuoi dati non
          sono stati toccati: riprova, oppure torna più tardi.
        </p>
        {error.digest ? (
          <p className="mt-1 text-xs text-muted-2">Codice: {error.digest}</p>
        ) : null}
        <button
          onClick={reset}
          className="mt-5 rounded-pill bg-teal px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
