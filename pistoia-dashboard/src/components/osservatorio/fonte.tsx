import { ExternalLink } from "lucide-react";
import type { Riga } from "@/lib/costo-amministrazione";

/*
  Come si cita un atto, in un posto solo.

  Nascono su /trasparenza/costo-amministrazione e si spostano qui quando
  /organigramma diventa la seconda pagina ad ancorare i propri fatti a una
  fonte. Due copie della stessa citazione divergono in silenzio — una smette di
  dichiarare la data di consultazione, l'altra perde il `rel` sul link esterno —
  e il difetto si vede solo mettendo le due pagine accanto. È la regola di
  AGENTS.md §3 (ondata 7): due definizioni della stessa cosa sono peggio di
  nessuna definizione.

  Niente `"use client"`: sono componenti di sola resa, e le pagine che li usano
  sono Server Component.
*/

export function LinkFonte({ riga }: { riga: Riga }) {
  return (
    <a
      href={riga.urlFonte}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 font-medium text-teal underline decoration-dotted underline-offset-2 hover:no-underline"
    >
      {riga.fonte}
      <ExternalLink size={12} aria-hidden />
      <span className="sr-only"> (si apre in una nuova scheda)</span>
    </a>
  );
}

export function DataConsultazione({ iso }: { iso: string }) {
  return (
    <time dateTime={iso}>
      {new Date(iso).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </time>
  );
}

export function SchedaFonte({ riga }: { riga: Riga }) {
  return (
    <li className="border-t border-border pt-3 first:border-t-0 first:pt-0">
      <p className="text-sm leading-relaxed">{riga.affermazione}</p>
      <p className="mt-1.5 text-xs text-muted-2">
        <LinkFonte riga={riga} /> · consultata il{" "}
        <DataConsultazione iso={riga.dataConsultazione} />
      </p>
    </li>
  );
}
