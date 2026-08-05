import Link from "next/link";
import { TIMBRO_METODOLOGIA } from "@/lib/metodologia";
import { FIRMA_REDAZIONE } from "@/lib/redazione";

/**
 * Il colophon delle pagine che calcolano (R-6, forma B2): la stessa riga su
 * scheda, panoramica e digest — in calce, accanto alla firma, mai in testata.
 *
 * Il timbro è tracciabilità, non notizia: la testata resta al dato e al suo
 * campione. La versione arriva da `lib/metodologia.ts`, la firma da
 * `lib/redazione.ts` — qui non c'è un carattere scritto a mano che possa
 * divergere.
 */
export function TimbroMetodologia() {
  return (
    <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-2">
      Medie e regole di questa pagina seguono la{" "}
      <Link
        href="/metodologia"
        className="whitespace-nowrap text-teal underline-offset-2 hover:underline"
      >
        {TIMBRO_METODOLOGIA}
      </Link>{" "}
      · {FIRMA_REDAZIONE}
    </p>
  );
}
