"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  chiediPopupAction,
  segnaEsitoSollecitazioneAction,
} from "@/app/actions/sollecitazioni";
import { EVENTO_COMPLETAMENTO_VOTO } from "@/lib/completamenti";
import { Card, CardEyebrow } from "@/components/ui/card";

/*
  Il pop-up laterale delle Valutazioni (R-5, ingresso D — piano §1.1.6).

  Le regole, tutte qui dentro perché si possano contare:
  - MAI a tempo, MAI all'arrivo: si arma solo all'evento «voto completato»
    (sondaggi, priorità, question time — decisione D1).
  - A decidere è il SERVER (`chiediPopupAction`: contatore unico + silenzio
    lungo della X): questo componente non conosce le regole, le chiede.
  - Chiudibile, e senza trappola del focus: nessun autofocus, nessun
    listener globale di tastiera — è un `complementary`, non un dialogo.
  - `pulse-civico` per l'ingresso: con `prefers-reduced-motion` il tema
    globale annulla le animazioni e il pop-up appare fermo.
  - Se la persona ha un rinnovo in sospeso, il testo veste la campagna
    (composizione di Lorenzo, 2026-08-04): stesso canale, altra frase.
  - Una volta per sessione di pagina: il ref tiene il conto anche se il
    server dicesse di nuovo sì.
*/
export function PopupValutazioni() {
  const [stato, setStato] = useState<{ rinnovo: string[] | null } | null>(null);
  const chiesto = useRef(false);

  useEffect(() => {
    function onCompletamento() {
      if (chiesto.current) return;
      chiesto.current = true;
      void chiediPopupAction().then((r) => {
        if (r.mostra) setStato({ rinnovo: r.rinnovo });
      });
    }
    window.addEventListener(EVENTO_COMPLETAMENTO_VOTO, onCompletamento);
    return () =>
      window.removeEventListener(EVENTO_COMPLETAMENTO_VOTO, onCompletamento);
  }, []);

  if (!stato) return null;

  function chiudi(esito: "chiusa" | "rimandata" | "seguita") {
    void segnaEsitoSollecitazioneAction("popup", esito);
    setStato(null);
  }

  return (
    <aside
      role="complementary"
      aria-label="Valutazioni dei servizi"
      aria-live="polite"
      className="pulse-civico fixed bottom-20 right-4 z-40 w-[300px] max-w-[calc(100vw-2rem)] lg:bottom-6 lg:right-6 print:hidden"
    >
      <Card className="p-4 sm:p-5">
        <div className="flex items-start gap-2.5">
          <div className="min-w-0 flex-1">
            <CardEyebrow>Valutazioni dei servizi</CardEyebrow>
            {stato.rinnovo ? (
              <p className="mt-2 text-[13px] leading-relaxed">
                È cominciato un mese nuovo: il tuo voto su{" "}
                <strong>{stato.rinnovo.join(", ")}</strong> si rinnova. Conta
                fino alla fine del mese.
              </p>
            ) : (
              <p className="mt-2 text-[13px] leading-relaxed">
                Hai un minuto? Di&apos; come sta la tua zona questo mese:
                pulizia, luce, verde, trasporti, sicurezza.
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/valutazioni"
                onClick={() => chiudi("seguita")}
                className="btn btn-primary btn-sm"
              >
                Valuta
              </Link>
              <button
                type="button"
                onClick={() => chiudi("rimandata")}
                className="btn btn-secondary btn-sm"
              >
                Non ora
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => chiudi("chiusa")}
            aria-label="Chiudi e non riproporre a lungo"
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X size={15} aria-hidden />
          </button>
        </div>
      </Card>
    </aside>
  );
}
