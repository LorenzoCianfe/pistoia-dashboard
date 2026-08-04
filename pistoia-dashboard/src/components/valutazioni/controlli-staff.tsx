"use client";

import { useActionState, useState } from "react";
import {
  rispondiQuadroAction,
  rispondiSingolaAction,
  segnalaValutazioneAction,
  type RispostaState,
} from "@/app/actions/risposte-servizio";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonClasses } from "@/components/ui/button";
import { MOTIVO_MAX, RISPOSTA_TESTO_MAX } from "@/lib/redazione";

/*
  I controlli del COMUNE sulla scheda (R-4, forma A1 — decisione 2026-08-03):
  si risponde dove si legge. Il Server Component li monta SOLO per staff e
  admin: per chiunque altro questi componenti non esistono nell'albero, quindi
  né i bottoni né lo stato «segnalata» raggiungono mai il browser di un
  cittadino.

  Rimuovere non si può da qui, per costruzione: queste azioni non lo sanno
  fare, e quelle che lo sanno fare (actions/redazione.ts) rifiutano gli
  account del Comune. È il cancello della fase.
*/

const CAMPO =
  "w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-2 transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--teal)_30%,transparent)]";

/** «Rispondi» + «Segnala alla redazione» sotto una recensione. */
export function ControlliRecensione({
  valutazioneId,
  segnalata,
  haRisposta,
}: {
  valutazioneId: string;
  segnalata: boolean;
  haRisposta: boolean;
}) {
  const [aperto, setAperto] = useState<"risposta" | "segnalazione" | null>(null);
  const [statoRisposta, rispondi] = useActionState<RispostaState, FormData>(
    rispondiSingolaAction,
    undefined,
  );
  const [statoSegnala, segnala] = useActionState<RispostaState, FormData>(
    segnalaValutazioneAction,
    undefined,
  );

  if (statoRisposta?.ok && aperto === "risposta") {
    // La risposta è in pagina dopo il refresh dei dati server: qui non resta
    // niente da mostrare.
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {!haRisposta ? (
          <button
            type="button"
            className={buttonClasses("ghost", "sm")}
            onClick={() => setAperto(aperto === "risposta" ? null : "risposta")}
          >
            Rispondi
          </button>
        ) : null}
        {segnalata || statoSegnala?.ok ? (
          <span className="text-xs text-muted-2">
            Segnalata alla redazione: resta pubblicata finché non decide.
          </span>
        ) : (
          <button
            type="button"
            className={buttonClasses("ghost", "sm")}
            onClick={() =>
              setAperto(aperto === "segnalazione" ? null : "segnalazione")
            }
          >
            Segnala alla redazione
          </button>
        )}
      </div>

      {aperto === "risposta" ? (
        <form action={rispondi} className="space-y-2">
          {statoRisposta?.error ? <Alert>{statoRisposta.error}</Alert> : null}
          <input type="hidden" name="valutazioneId" value={valutazioneId} />
          <textarea
            name="testo"
            rows={3}
            required
            maxLength={RISPOSTA_TESTO_MAX}
            aria-label="Testo della risposta"
            placeholder="La risposta compare sotto la recensione, firmata dall'account con cui scrivi."
            className={CAMPO}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton pendingText="Invio…">Pubblica la risposta</SubmitButton>
            <button
              type="button"
              className={buttonClasses("ghost", "sm")}
              onClick={() => setAperto(null)}
            >
              Annulla
            </button>
          </div>
        </form>
      ) : null}

      {aperto === "segnalazione" && !statoSegnala?.ok ? (
        <form action={segnala} className="space-y-2">
          {statoSegnala?.error ? <Alert>{statoSegnala.error}</Alert> : null}
          <input type="hidden" name="valutazioneId" value={valutazioneId} />
          <input
            name="motivo"
            required
            maxLength={MOTIVO_MAX}
            aria-label="Motivo della segnalazione"
            placeholder="Perché la contesti? È ciò che la redazione esamina."
            className={CAMPO}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton pendingText="Invio…">Segnala</SubmitButton>
            <button
              type="button"
              className={buttonClasses("ghost", "sm")}
              onClick={() => setAperto(null)}
            >
              Annulla
            </button>
          </div>
          <p className="text-xs leading-relaxed text-muted-2">
            La segnalazione non toglie niente dalla pagina: decide la redazione,
            e ogni rimozione lascia una riga nel registro pubblico.
          </p>
        </form>
      ) : null}
    </div>
  );
}

/** «Rispondi al quadro» nella sezione «Le risposte». */
export function RispondiQuadro({
  servizioId,
  etichetta,
  giaRisposto,
}: {
  servizioId: string;
  /** «luglio 2026» — composta dal server, mai qui. */
  etichetta: string;
  giaRisposto: boolean;
}) {
  const [aperto, setAperto] = useState(false);
  const [stato, rispondi] = useActionState<RispostaState, FormData>(
    rispondiQuadroAction,
    undefined,
  );

  if (giaRisposto || stato?.ok) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        className={buttonClasses("secondary", "sm")}
        onClick={() => setAperto(!aperto)}
      >
        Rispondi al quadro di {etichetta}
      </button>
      {aperto ? (
        <form action={rispondi} className="space-y-2">
          {stato?.error ? <Alert>{stato.error}</Alert> : null}
          <input type="hidden" name="servizioId" value={servizioId} />
          <textarea
            name="testo"
            rows={4}
            required
            maxLength={RISPOSTA_TESTO_MAX}
            aria-label={`Risposta al quadro di ${etichetta}`}
            placeholder="Una risposta al mese, sul quadro complessivo: numeri e andamento restano fuori dal blocco firmato."
            className={CAMPO}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton pendingText="Invio…">Pubblica la risposta</SubmitButton>
            <button
              type="button"
              className={buttonClasses("ghost", "sm")}
              onClick={() => setAperto(false)}
            >
              Annulla
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
