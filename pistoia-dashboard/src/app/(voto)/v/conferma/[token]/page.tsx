import type { Metadata } from "next";
import {
  confermaValutazioneAction,
  revocaValutazioneAction,
} from "@/app/actions/valutazioni";
import { getValutazionePerToken } from "@/lib/data/valutazioni";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { SubmitButton } from "@/components/ui/submit-button";
import { BadgeCheck, MapPin } from "lucide-react";

/*
  L'atterraggio del link nella mail. Il token è l'unica chiave: chi ha la mail
  decide, nessun account richiesto.

  I due esiti sono AZIONI di form, mai effetti del GET: i filtri antispam
  aprono i link per ispezionarli, e un link che al passaggio confermasse — o
  peggio, rimuovesse — agirebbe al posto della persona. La pagina mostra la
  valutazione così com'è (stelle, testo, luogo): «non sono stato io» si può
  dire solo sapendo di cosa si parla.

  Vive sotto `/v/` e non sotto `/valutazioni/` per una ragione di guardia, non
  di gusto: `src/proxy.ts` protegge `/valutazioni` con il cookie di sessione,
  e chi clicca dalla propria posta una sessione non ce l'ha — finirebbe al
  login (visto accadere: i primi due E2E del cancello cadevano proprio lì).
  `/v/` è il prefisso pubblico delle pagine che arrivano da fuori.
*/

export const metadata: Metadata = { title: "È tua questa valutazione?" };

function Marca() {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
      Pistoia.app · Valutazioni dei servizi
    </p>
  );
}

export default async function ConfermaValutazionePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ esito?: string }>;
}) {
  const { token } = await params;
  const { esito } = await searchParams;
  const v = await getValutazionePerToken(token);

  // La revoca cancella la riga, quindi il token non risolve più: il redirect
  // porta qui `?esito=rimossa` per distinguere «fatto» da «link scaduto».
  if (!v && esito === "rimossa") {
    return (
      <>
        <Marca />
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Valutazione rimossa
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted" role="status">
          Il voto è fuori dal conteggio e l&apos;indirizzo email è stato
          cancellato con lui. Non c&apos;è altro da fare.
        </p>
      </>
    );
  }

  if (!v) {
    return (
      <>
        <Marca />
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Questo link non è più valido
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          La valutazione a cui portava potrebbe essere già stata rimossa. Se
          l&apos;hai appena fatto tu, è tutto a posto: non resta nulla da
          confermare.
        </p>
      </>
    );
  }

  const quando = v.quando.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Marca />
      <h1 className="mt-6 text-xl font-semibold tracking-tight">
        È tua questa valutazione?
      </h1>

      <Card className="mt-5">
        <p className="text-sm font-semibold">{v.servizio.nome}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <StarRating value={v.stelle} size={16} />
          <span className="text-sm tabular-nums text-muted">{v.stelle} su 5</span>
        </div>
        <p className="mt-1 text-xs text-muted-2">
          {quando}
          {v.qrLuogo ? (
            <>
              {" · "}
              <MapPin size={11} aria-hidden className="inline align-[-1px]" />{" "}
              {v.qrLuogo}
            </>
          ) : null}
        </p>
        {v.testo ? (
          <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed">
            {v.testo}
          </p>
        ) : null}

        <div className="mt-4 border-t border-border pt-4">
          {v.emailConfermata ? (
            <p
              className="flex items-center gap-1.5 text-sm font-medium text-teal"
              role="status"
            >
              <BadgeCheck size={16} aria-hidden />
              Confermata: nella composizione conta fra le «da email confermata».
            </p>
          ) : (
            <form action={confermaValutazioneAction.bind(null, token)}>
              <SubmitButton pendingText="Confermo…">
                Sì, sono stato io
              </SubmitButton>
            </form>
          )}

          <form
            action={revocaValutazioneAction.bind(null, token)}
            className="mt-3"
          >
            <SubmitButton variant="danger" size="sm" pendingText="Rimozione…">
              Non sono stato io: rimuovi
            </SubmitButton>
          </form>
          <p className="mt-3 text-xs leading-relaxed text-muted-2">
            Il voto è già nel conteggio e ci resta anche senza conferma: la
            conferma lo dichiara più solido, la rimozione lo cancella subito
            insieme all&apos;indirizzo email.
          </p>
        </div>
      </Card>
    </>
  );
}
