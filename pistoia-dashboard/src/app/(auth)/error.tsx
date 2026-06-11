"use client";

import { useEffect, useRef } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Sposta il focus sull'intestazione: senza, lo screen reader non si accorge
  // che il contenuto è stato sostituito dal boundary (WCAG 4.1.3 / 2.4.3).
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="grid min-h-[40vh] place-items-center px-4">
      <div className="max-w-sm text-center">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold tracking-tight outline-none"
        >
          Qualcosa è andato storto
        </h1>
        <p className="mt-2 text-sm text-muted">
          Non siamo riusciti a caricare la pagina di accesso. Riprova.
        </p>
        {error.digest ? (
          <p className="mt-1 text-xs text-muted-2">Codice: {error.digest}</p>
        ) : null}
        <button
          onClick={reset}
          className="mt-4 rounded-pill bg-teal px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
