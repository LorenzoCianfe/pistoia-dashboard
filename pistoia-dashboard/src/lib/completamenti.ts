/*
  Il segnale «ho appena completato qualcosa» (R-5, ingresso D).

  Modulo neutro senza dipendenze: i componenti di voto lo chiamano al
  successo, e il pop-up delle Valutazioni lo ascolta dal layout. Un
  CustomEvent su window invece di un contesto React, perché chi emette e chi
  ascolta stanno in alberi lontani e non condividono antenati utili.

  Il pop-up si arma SOLO dai voti espressi (sondaggio, priorità, question
  time — decisione D1 del 2026-08-04): completamenti senza momento di festa,
  dove chiedere un'altra opinione è un seguito e non un furto di scena.
*/

export const EVENTO_COMPLETAMENTO_VOTO = "pistoia:voto-completato";

/** Da chiamare nei componenti client, a successo avvenuto. */
export function segnalaCompletamentoVoto(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENTO_COMPLETAMENTO_VOTO));
}
