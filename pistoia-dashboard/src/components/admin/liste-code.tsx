import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { ElencoCoda, VoceCoda } from "@/components/admin/coda";
import {
  reportCategory,
  reportStatus,
  reportUrgency,
  proposalStatus,
} from "@/lib/community";
import { formatNumber } from "@/lib/format";
import type {
  getSegnalazioniAperte,
  getProposteDaValutare,
  getDomandeSenzaRisposta,
  getValutazioniDaEsaminare,
} from "@/lib/data/admin";

/*
  LE QUATTRO LISTE DELLE CODE, in un posto solo.

  Ognuna è resa **due volte**: a tutta larghezza sull'indice della coda
  (~804px) e nella colonna del dettaglio (**304px**). È la ragione per cui la
  riga (`coda.tsx`, `VoceCoda`) è un `@container`, e per cui qui si scrive
  `@max-sm:hidden` e non `sm:hidden`: il contenitore da misurare è la riga, non
  la finestra (`DESIGN.md` §6).

  Che cosa cade nella colonna stretta, e perché proprio quello: la **categoria**
  della segnalazione, che è l'unica pastiglia che non dice né a che punto è la
  voce né se ha fretta. Stato e urgenza restano a tutte le larghezze.

  Tutti Server Component: una lista è testo e collegamenti, e non ha ragione di
  arrivare al browser come JavaScript.
*/

type Attivo = { attivo?: string };

// ---------------------------------------------------------------------------

export function ListaSegnalazioni({
  voci,
  attivo,
}: Attivo & { voci: Awaited<ReturnType<typeof getSegnalazioniAperte>> }) {
  return (
    <ElencoCoda quante={voci.length} vuoto="Nessuna segnalazione aperta. 🎉">
      {voci.map((v) => {
        const cat = reportCategory(v.category);
        const urgenza = reportUrgency(v.urgency);
        return (
          <VoceCoda
            key={v.id}
            href={`/admin/segnalazioni/${v.id}`}
            titolo={v.title}
            attiva={v.id === attivo}
          >
            <span className="@max-sm:hidden">
              <Badge color={cat.color}>{cat.label}</Badge>
            </span>
            <Badge color={reportStatus(v.status).color}>
              {reportStatus(v.status).label}
            </Badge>
            {urgenza ? <Badge color={urgenza.color}>{urgenza.label}</Badge> : null}
            <span>
              {formatNumber(v.confirmations)} conferme
              <span className="@max-sm:hidden">
                {v.neighborhoodName ? ` · ${v.neighborhoodName}` : ""}
              </span>
            </span>
          </VoceCoda>
        );
      })}
    </ElencoCoda>
  );
}

// ---------------------------------------------------------------------------

export function ListaProposte({
  voci,
  attivo,
}: Attivo & { voci: Awaited<ReturnType<typeof getProposteDaValutare>> }) {
  return (
    <ElencoCoda quante={voci.length} vuoto="Nessuna proposta da valutare.">
      {voci.map((v) => (
        <VoceCoda
          key={v.id}
          href={`/admin/proposte/${v.id}`}
          titolo={v.title}
          attiva={v.id === attivo}
        >
          <Badge color={proposalStatus(v.status).color}>
            {proposalStatus(v.status).label}
          </Badge>
          <span className="font-semibold tabular-nums">
            {formatNumber(v.supports)} sostegni
          </span>
          {/*
            «risposta pubblicata» SOLO quando la pastiglia non lo dice già: con
            stato `risposta` la pastiglia legge «Risposta del Comune», e dirlo
            due volte a due centimetri di distanza non aggiunge niente. Negli
            altri stati è un'informazione in più — una proposta ancora
            «Pubblicata» può avere già una risposta scritta.
          */}
          {v.hasReply && v.status !== "risposta" ? (
            <span className="@max-sm:hidden">· risposta pubblicata</span>
          ) : null}
        </VoceCoda>
      ))}
    </ElencoCoda>
  );
}

// ---------------------------------------------------------------------------

export function ListaDomande({
  voci,
  attivo,
}: Attivo & { voci: Awaited<ReturnType<typeof getDomandeSenzaRisposta>> }) {
  return (
    <ElencoCoda
      quante={voci.length}
      vuoto="Nessuna domanda in attesa. Ottimo lavoro! 🎉"
    >
      {voci.map((v) => (
        <VoceCoda
          key={v.id}
          href={`/admin/domande/${v.id}`}
          titolo={v.content}
          attiva={v.id === attivo}
        >
          <span className="font-semibold text-muted">{v.authorName}</span>
          {v.quartiere ? <span className="@max-sm:hidden">· {v.quartiere}</span> : null}
          {/*
            La data si formatta col fuso del server e si legge col fuso del
            browser: `suppressHydrationWarning` è la convenzione già usata in
            tutto il repository per le date relative.
          */}
          <span suppressHydrationWarning>
            ·{" "}
            {v.createdAt.toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </VoceCoda>
      ))}
    </ElencoCoda>
  );
}

// ---------------------------------------------------------------------------

export function ListaValutazioni({
  voci,
  attivo,
}: Attivo & { voci: Awaited<ReturnType<typeof getValutazioniDaEsaminare>> }) {
  return (
    <ElencoCoda
      quante={voci.length}
      vuoto="Nessuna recensione in attesa: i voti senza parole non hanno niente a cui rispondere."
    >
      {voci.map((v) => (
        <VoceCoda
          key={v.id}
          href={`/admin/valutazioni/${v.id}`}
          /* Il testo è ciò che si giudica, quindi è lui il titolo della riga.
             Il servizio e le stelle stanno sotto, dove stanno gli altri stati. */
          titolo={v.testo ?? "Voto senza parole"}
          attiva={v.id === attivo}
        >
          <StarRating value={v.stelle} size={12} />
          <span className="font-semibold text-muted">{v.servizio}</span>
          <span className="@max-sm:hidden">· {v.autore}</span>
        </VoceCoda>
      ))}
    </ElencoCoda>
  );
}
