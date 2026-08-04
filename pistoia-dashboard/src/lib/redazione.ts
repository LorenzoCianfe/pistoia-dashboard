/**
 * La Redazione e le regole di R-4 — risposte, segnalazioni, moderazione.
 *
 * Modulo **neutro** di proposito (niente `"use client"`, niente `server-only`):
 * lo importano le pagine (Server Component), le azioni, `ChiPubblica` e i test.
 *
 * ## Chi è «la Redazione»
 *
 * L'entità collettiva che firma i giudizi della piattaforma (decisione di
 * Lorenzo, 2026-08-03 — `docs/piano-rating-servizi.md` §8.3): reale, ma la
 * faccia pubblica è SOLO l'entità. Registro, rimozioni e Note portano
 * {@link FIRMA_REDAZIONE}; nessuna superficie di moderazione espone un nome
 * proprio.
 *
 * ## Il cancello dei ruoli, e perché ADMIN resta fuori
 *
 * Nel modello dei ruoli (SECURITY.md §4) `ADMIN` è il **super-account del
 * Comune**, non un livello "sopra" la piattaforma. E il piano (§2.6) non lascia
 * cancellare al Comune ciò che lo riguarda: chi è giudicato può segnalare,
 * rimuove solo la Redazione. Quindi {@link isRedazione} è vera SOLO per il
 * ruolo `MODERATOR` — il cancello di R-4 è il test che prova che né `ADMIN`
 * né `MUNICIPAL_STAFF` passano di qui.
 */

import { GIUNTA } from "./giunta";

/**
 * La firma collettiva. La stessa di `ChiPubblica` — che la importa da qui,
 * perché due definizioni della stessa firma sono peggio di nessuna firma
 * (AGENTS.md §3, ondata 7).
 */
export const FIRMA_REDAZIONE = "Redazione della Dashboard di Pistoia";

/** Vero SOLO per il ruolo `MODERATOR`: vedi il commento di testa del modulo. */
export function isRedazione(role: string): boolean {
  return role === "MODERATOR";
}

/** Rimuove la Redazione, mai il Comune (piano §2.6). Alias dichiarativo. */
export const puoRimuovere = isRedazione;

// ---------------------------------------------------------------------------
// I tre tipi di RispostaServizio
// ---------------------------------------------------------------------------

export const TIPO_QUADRO = "quadro";
export const TIPO_SINGOLA = "singola";
export const TIPO_NOTA_REDAZIONE = "nota-redazione";

/** La risposta può essere lunga il doppio di una recensione, non un saggio. */
export const RISPOSTA_TESTO_MAX = 1600;
/** Motivi (segnalazione e rimozione): una frase, non un fascicolo. */
export const MOTIVO_MAX = 240;
export const NOTA_TESTO_MAX = 800;

// ---------------------------------------------------------------------------
// Il timbro della carica
// ---------------------------------------------------------------------------

/**
 * «Assessore al Bilancio nel 2026» — scattato AL MOMENTO della scrittura e
 * salvato in `caricaAlMomento`, mai ricalcolato dopo: una risposta archiviata
 * non deve continuare ad affermare un incarico che quella persona non ricopre
 * più (piano §1.1.3).
 *
 * L'aggancio è l'email dell'account: `lib/giunta.ts` porta i recapiti letti
 * dalle schede personali del Comune, uno per uno. Un account personale con
 * un'email fuori dalla giunta scrive senza timbro — meglio nessuna carica che
 * una carica dedotta (AGENTS.md §4, trappola 4 delle fonti).
 */
export function timbroCarica(email: string, quando: Date): string | null {
  const chiave = email.trim().toLowerCase();
  const componente = GIUNTA.find((c) => c.email.toLowerCase() === chiave);
  if (!componente) return null;
  return `${componente.carica} nel ${quando.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// La disciplina della Nota della Redazione
// ---------------------------------------------------------------------------

/**
 * Una Nota senza fonte NON va a schermo — stessa regola di
 * `lib/costo-amministrazione.ts` (`rigaPubblicabile`): il renderer rifiuta,
 * non "degrada". La Redazione aggiunge un dato, e un dato senza fonte è
 * un'opinione vestita da dato.
 *
 * Vale solo per il tipo `nota-redazione`: le risposte del Comune sono parole
 * di chi risponde, non affermazioni ancorate a un atto.
 */
export function notaPubblicabile(r: {
  tipo: string;
  urlFonte?: string | null;
  dataConsultazione?: string | null;
}): boolean {
  if (r.tipo !== TIPO_NOTA_REDAZIONE) return true;
  const url = (r.urlFonte ?? "").trim();
  const data = (r.dataConsultazione ?? "").trim();
  return url.length > 0 && data.length > 0;
}

// ---------------------------------------------------------------------------
// Il periodo, in parole
// ---------------------------------------------------------------------------

const MESI = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

/** `"2026-07"` → `"luglio 2026"`. Per l'eyebrow della risposta al quadro. */
export function etichettaPeriodo(periodo: string): string {
  const [anno, mese] = periodo.split("-");
  const idx = Number(mese) - 1;
  if (!anno || idx < 0 || idx > 11 || Number.isNaN(idx)) return periodo;
  return `${MESI[idx]} ${anno}`;
}
