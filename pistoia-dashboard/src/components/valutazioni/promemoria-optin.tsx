"use client";

import { useState, useTransition } from "react";
import { BellRing, Check } from "lucide-react";
import { chiediPromemoriaAction } from "@/app/actions/sollecitazioni";

/*
  L'opt-in del promemoria mensile (R-5, ingresso B3): compare nel messaggio
  di successo del voto, SOLO per le condizioni (gli sportelli non si
  rinnovano). Un tocco, mai una casella pre-spuntata: il promemoria è
  chiesto, non imposto — e per questo è l'unico canale che può raggiungere
  anche chi vota dal QR senza account.
*/
export function PromemoriaOptin({ valutazioneId }: { valutazioneId: string }) {
  const [pending, startTransition] = useTransition();
  const [esito, setEsito] = useState<"ok" | string | null>(null);

  if (esito === "ok") {
    return (
      <p className="mt-3 flex items-start gap-1.5 text-sm text-muted" role="status">
        <Check size={15} className="mt-0.5 shrink-0 text-[var(--green)]" aria-hidden />
        Promemoria attivo: a inizio mese ti scriviamo una volta sola.
        Ogni mail ha il suo «non inviarmelo più».
      </p>
    );
  }

  return (
    <div className="mt-3">
      {esito ? (
        <p role="alert" className="mb-2 text-xs font-medium text-[var(--red)]">
          {esito}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await chiediPromemoriaAction(valutazioneId);
            setEsito(res?.ok ? "ok" : (res?.error ?? "Non è stato possibile. Riprova."));
          })
        }
        className="btn btn-secondary btn-sm"
      >
        <BellRing size={14} aria-hidden />
        Ricordamelo il mese prossimo
      </button>
    </div>
  );
}
