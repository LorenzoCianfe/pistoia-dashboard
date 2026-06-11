"use client";

import { useEffect, useRef } from "react";

// Ultima rete di salvataggio: cattura gli errori del root layout stesso.
// Deve dichiarare <html>/<body> e non può contare sul CSS globale.
export default function GlobalError({
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

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <html lang="it">
      <body
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fbfbfd",
          color: "#1c2430",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1
            ref={headingRef}
            tabIndex={-1}
            style={{ fontSize: 22, marginBottom: 8, outline: "none" }}
          >
            Qualcosa è andato storto
          </h1>
          <p style={{ fontSize: 14, color: "#5b6675", marginBottom: 16 }}>
            Un errore imprevisto ha interrotto la pagina. Riprova: di solito
            basta.
          </p>
          {error?.digest ? (
            <p style={{ fontSize: 12, color: "#8b94a3", marginBottom: 16 }}>
              Codice: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              border: "1px solid #d8dde5",
              borderRadius: 999,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
              background: "#0f766e",
              color: "#fff",
            }}
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  );
}
