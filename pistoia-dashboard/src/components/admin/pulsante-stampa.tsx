"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** L'unico motivo per cui la pagina dei codici QR ha bisogno di JavaScript. */
export function PulsanteStampa() {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <Printer size={16} aria-hidden />
      Stampa i fogli
    </Button>
  );
}
