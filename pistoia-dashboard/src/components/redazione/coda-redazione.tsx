"use client";

import { useActionState } from "react";
import {
  lasciaValutazioneAction,
  rimuoviValutazioneAction,
  type RedazioneState,
} from "@/app/actions/redazione";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonClasses } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { MOTIVO_MAX } from "@/lib/redazione";

/*
  Un elemento della coda della Redazione (R-4, forma B1). Due sole uscite:
  rimuovere — con un motivo che finisce nel registro PUBBLICO della scheda —
  o lasciare pubblicata. Il testo qui è quello che i lettori vedono, non i
  dati grezzi: la Redazione giudica la stessa cosa che giudica la città.
*/

export type ItemCoda = {
  id: string;
  servizio: string;
  stelle: number;
  testo: string | null;
  autore: string;
  quando: string;
  segnalataIl: string;
  segnalataMotivo: string | null;
};

const CAMPO =
  "w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-2 transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]";

export function ElementoCoda({ item }: { item: ItemCoda }) {
  const [statoRimuovi, rimuovi] = useActionState<RedazioneState, FormData>(
    rimuoviValutazioneAction,
    undefined,
  );
  const [statoLascia, lascia] = useActionState<RedazioneState, FormData>(
    lasciaValutazioneAction,
    undefined,
  );

  // A decisione presa non c'è un messaggio da mostrare QUI: `revalidatePath`
  // rinfresca la coda e l'elemento esce dall'albero — la conferma è la coda
  // che si accorcia (e, per la rimozione, la riga nel registro della scheda).
  // Restano visibili solo gli errori, che lasciano l'elemento al suo posto.
  return (
    <div className="border-t border-border pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {item.servizio}
          <StarRating value={item.stelle} size={13} />
          <span className="font-normal text-muted">{item.autore}</span>
          <span className="font-normal text-muted-2">· {item.quando}</span>
        </p>
        <p className="text-xs text-muted-2">segnalata dal Comune il {item.segnalataIl}</p>
      </div>

      {item.testo ? (
        <p className="mt-1.5 text-sm leading-relaxed">«{item.testo}»</p>
      ) : (
        <p className="mt-1.5 text-sm text-muted">(voto senza testo)</p>
      )}
      {item.segnalataMotivo ? (
        <p className="mt-1.5 text-xs font-medium text-[var(--amber)]">
          Motivo della segnalazione: {item.segnalataMotivo}
        </p>
      ) : null}

      <form action={rimuovi} className="mt-3 space-y-2">
        {statoRimuovi?.error ? <Alert>{statoRimuovi.error}</Alert> : null}
        <input type="hidden" name="valutazioneId" value={item.id} />
        <input
          name="motivo"
          required
          maxLength={MOTIVO_MAX}
          aria-label="Motivo pubblico della rimozione"
          placeholder="Motivo pubblico della rimozione (finisce nel registro della scheda)…"
          className={CAMPO}
        />
        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton variant="danger" pendingText="Rimozione…">
            Rimuovi — azzera il testo, la riga resta
          </SubmitButton>
        </div>
      </form>

      <form action={lascia} className="mt-2">
        {statoLascia?.error ? <Alert>{statoLascia.error}</Alert> : null}
        <input type="hidden" name="valutazioneId" value={item.id} />
        <button type="submit" className={buttonClasses("secondary", "sm")}>
          Lascia pubblicata
        </button>
      </form>
    </div>
  );
}
