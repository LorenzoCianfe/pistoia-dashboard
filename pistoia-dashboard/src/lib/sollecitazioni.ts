/**
 * Il contatore unico delle sollecitazioni — le regole (R-5, piano §1.1.7).
 *
 * Modulo **neutro** come `lib/valutazioni.ts`: lo importano le pagine, le
 * azioni e i test. Qui vivono solo funzioni pure con la data esplicita, così
 * il cancello della fase si prova a date fisse, come `statoPubblicazione()`.
 *
 * ## La regola in una riga
 *
 * Sei ingressi, ma una persona è sollecitata **al massimo una volta per
 * finestra**, contata al centro: sei canali che chiedono ciascuno per sé
 * fanno sembrare la piattaforma una questua.
 *
 * ## Che cosa conta, che cosa no (decisioni di Lorenzo, 2026-08-04)
 *
 * - **Contano**: l'invito dopo la risoluzione (`segnalazione`), la campagna
 *   mensile (`campagna` — card in home, notifica ed email sono UNA
 *   sollecitazione), il pop-up (`popup`).
 * - **Non contano**: la voce di menu e i QR (destinazioni, non richieste), e
 *   il blocco nel report del mese — contenuto di una pagina che si sceglie di
 *   aprire, uguale per tutti, non una spinta mirata.
 * - **Un voto chiude la finestra**: chi ha appena valutato, da qualunque
 *   porta, non riceve richieste per `RICHIESTA_SILENZIO_GIORNI`.
 * - Una sollecitazione che resta a schermo qualche giorno (la card in home,
 *   finché non rispondi) conta **una volta**: è la stessa domanda ancora
 *   aperta, non una nuova.
 * - L'**ancora è l'account**: chi non ne ha uno entra dai QR e non viene mai
 *   sollecitato. La registrazione della mostra parte da un'azione (dal client
 *   al montaggio, o dentro l'azione che produce l'invito) — mai una scrittura
 *   dentro un GET, la stessa disciplina dei link nelle email.
 */

import {
  RICHIESTA_SILENZIO_GIORNI,
  SERVIZI,
  periodoDi,
  type Servizio,
} from "@/lib/valutazioni";

// ---------------------------------------------------------------------------
// I canali e le costanti
// ---------------------------------------------------------------------------

/** I tre canali che sollecitano. Gli altri ingressi non scrivono righe. */
export const CANALI_SOLLECITAZIONE = ["segnalazione", "campagna", "popup"] as const;
export type CanaleSollecitazione = (typeof CANALI_SOLLECITAZIONE)[number];

/** Gli esiti possibili di una sollecitazione. `null` in banca dati = ignorata. */
export const ESITI_SOLLECITAZIONE = ["seguita", "rimandata", "chiusa"] as const;
export type EsitoSollecitazione = (typeof ESITI_SOLLECITAZIONE)[number];

/**
 * Quanto tace il pop-up dopo la X (piano §1.1.6, «silenzioso a lungo»,
 * tradotto in un numero da Lorenzo il 2026-08-04): sei mesi, come la vita
 * dell'IP — abbastanza da non essere una zanzara, senza essere un mai-più.
 * «Non ora» invece vale solo la finestra ordinaria dei 30 giorni.
 */
export const SILENZIO_POPUP_CHIUSO_GIORNI = 180;

const GIORNO_MS = 86_400_000;

// ---------------------------------------------------------------------------
// Il contatore
// ---------------------------------------------------------------------------

/** Ciò che serve a decidere se si può chiedere. Date, non righe di database. */
export type StatoSollecitazioni = {
  /** L'ultima sollecitazione mostrata, su qualunque canale. */
  ultimaSollecitazione: Date | null;
  /** L'ultima valutazione lasciata da questa persona, da qualunque porta. */
  ultimoVoto: Date | null;
};

/**
 * Vero quando la finestra è libera e si può sollecitare.
 *
 * Due orologi, uno solo basta a chiudere: l'ultima richiesta mostrata (da
 * qualunque canale) e l'ultimo voto lasciato (la domanda ha già avuto
 * risposta). Pura e con la data esplicita: è il cancello della fase.
 */
export function puoSollecitare(
  oggi: Date,
  stato: StatoSollecitazioni,
  giorni: number = RICHIESTA_SILENZIO_GIORNI,
): boolean {
  const limite = giorni * GIORNO_MS;
  if (
    stato.ultimaSollecitazione != null &&
    oggi.getTime() - stato.ultimaSollecitazione.getTime() < limite
  ) {
    return false;
  }
  if (
    stato.ultimoVoto != null &&
    oggi.getTime() - stato.ultimoVoto.getTime() < limite
  ) {
    return false;
  }
  return true;
}

/**
 * Il pop-up ha una regola in più: la X impone un silenzio lungo
 * ({@link SILENZIO_POPUP_CHIUSO_GIORNI}), perché è il canale più invadente e
 * un no esplicito va rispettato più a lungo di una finestra qualsiasi.
 */
export function puoMostrarePopup(
  oggi: Date,
  stato: StatoSollecitazioni & { popupChiusoIl: Date | null },
  giorni: number = RICHIESTA_SILENZIO_GIORNI,
  silenzioChiusura: number = SILENZIO_POPUP_CHIUSO_GIORNI,
): boolean {
  if (
    stato.popupChiusoIl != null &&
    oggi.getTime() - stato.popupChiusoIl.getTime() < silenzioChiusura * GIORNO_MS
  ) {
    return false;
  }
  return puoSollecitare(oggi, stato, giorni);
}

// ---------------------------------------------------------------------------
// L'ingresso contestuale (A): dalla categoria della segnalazione alla casella
// ---------------------------------------------------------------------------

/**
 * La condizione della città a cui una categoria di segnalazione appartiene,
 * o `null` — e il `null` è la risposta giusta, non un buco: per «buche» o
 * «rumore» non esiste una casella da votare, quindi non esiste un invito.
 * Derivata da `Servizio.categorieReport`, la stessa mappa della colonna dura:
 * una definizione sola (AGENTS §3, ondata 7).
 */
export function condizionePerCategoria(categoria: string): Servizio | null {
  return (
    SERVIZI.find(
      (s) => s.famiglia === "condizione" && s.categorieReport.includes(categoria),
    ) ?? null
  );
}

// ---------------------------------------------------------------------------
// La campagna mensile (B)
// ---------------------------------------------------------------------------

/** Il periodo `AAAA-MM` precedente a quello dato. */
export function periodoPrecedente(periodo: string): string {
  const [anno, mese] = periodo.split("-").map(Number);
  const d = new Date(Date.UTC(anno, mese - 2, 1));
  return periodoDi(d);
}

/**
 * Vero quando la persona è nel pubblico della campagna del mese: ha valutato
 * almeno una condizione **il mese scorso** e questo mese non ancora. Chi non
 * ha mai votato non è pubblico di un «rinnovo»; chi ha già rinnovato nemmeno.
 */
export function inPubblicoCampagna(
  oggi: Date,
  periodiVotoCondizioni: string[],
): boolean {
  const corrente = periodoDi(oggi);
  const precedente = periodoPrecedente(corrente);
  return (
    periodiVotoCondizioni.includes(precedente) &&
    !periodiVotoCondizioni.includes(corrente)
  );
}

// ---------------------------------------------------------------------------
// Il promemoria per email (B3)
// ---------------------------------------------------------------------------

/**
 * Vero quando la mail del mese non è ancora partita per questo promemoria.
 * `ultimoInvio` è `AAAA-MM`: il confronto lessicografico è anche cronologico.
 */
export function promemoriaDovuto(oggi: Date, ultimoInvio: string | null): boolean {
  const corrente = periodoDi(oggi);
  return ultimoInvio == null || ultimoInvio < corrente;
}
