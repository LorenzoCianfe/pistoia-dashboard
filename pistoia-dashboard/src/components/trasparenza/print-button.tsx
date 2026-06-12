"use client";

import { Printer } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/*
  Export PDF del digest (A2 §19): la pagina ha uno stile di stampa curato
  (variant print: di Tailwind), quindi "Scarica PDF" = stampa del browser →
  "Salva come PDF". Zero dipendenze, perfetto per la demo.
*/

export function PrintButton({ label = "Scarica PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={buttonClasses("secondary", "sm")}
    >
      <Printer size={15} aria-hidden />
      {label}
    </button>
  );
}
