"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  registraCampagnaAction,
  segnaEsitoSollecitazioneAction,
} from "@/app/actions/sollecitazioni";
import { Card, CardEyebrow } from "@/components/ui/card";

/*
  La campagna mensile in home (R-5, ingresso B1) — vive nello slot dei
  richiami, sotto il saluto e sopra «Cosa vuoi fare?», come l'onboarding.

  Chi la vede lo decide il server (`getCampagnaPersona`: pubblico del rinnovo
  + contatore unico); qui restano tre compiti da client:
  - il BEACON: alla prima mostra del mese si registra la sollecitazione con
    un'azione — mai una scrittura dentro il GET della pagina;
  - gli esiti: «Rinnova» = seguita, «Non questo mese» e la X = rimandata
    (il silenzio lungo della X è una regola del solo pop-up);
  - sparire subito alla chiusura, senza aspettare il server.

  La card che resta a schermo finché non rispondi conta UNA volta: è la
  stessa domanda ancora aperta, non una nuova (piano §1.1.7).
*/
export function CampagnaHome({
  serviziRinnovabili,
  daRegistrare,
  mese,
}: {
  serviziRinnovabili: string[];
  daRegistrare: boolean;
  /** Etichetta del mese corrente, già composta («agosto 2026»). */
  mese: string;
}) {
  const [chiusa, setChiusa] = useState(false);
  const registrata = useRef(false);

  useEffect(() => {
    if (!daRegistrare || registrata.current) return;
    registrata.current = true;
    void registraCampagnaAction();
  }, [daRegistrare]);

  if (chiusa) return null;

  function congeda(esito: "seguita" | "rimandata") {
    void segnaEsitoSollecitazioneAction("campagna", esito);
    setChiusa(true);
  }

  const nomi = serviziRinnovabili.join(", ");

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <CardEyebrow>Valutazioni dei servizi</CardEyebrow>
          <p className="mt-1.5 text-base font-semibold">
            È cominciato {mese.split(" ")[0]}: il voto sulle condizioni si
            rinnova
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Il mese scorso hai valutato{" "}
            <strong className="text-foreground">{nomi}</strong>. Il polso degli
            ultimi tre mesi vive di voti freschi: quelli di questo mese contano
            fino all&apos;ultimo giorno.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/valutazioni"
              onClick={() => congeda("seguita")}
              className="btn btn-primary btn-sm"
            >
              Rinnova il voto
            </Link>
            <button
              type="button"
              onClick={() => congeda("rimandata")}
              className="btn btn-secondary btn-sm"
            >
              Non questo mese
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => congeda("rimandata")}
          aria-label="Chiudi per questo mese"
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <X size={15} aria-hidden />
        </button>
      </div>
    </Card>
  );
}
