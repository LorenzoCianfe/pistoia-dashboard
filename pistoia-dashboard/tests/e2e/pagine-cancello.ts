import { ADMIN, MODERATORE } from "./helpers";

/**
 * Le pagine che i cancelli di accessibilità attraversano, in un posto solo.
 *
 * Stavano dentro `accessibilita.spec.ts`. Sono uscite di lì il 2026-08-07,
 * quando il cancello dei bersagli (`bersagli.spec.ts`) ha avuto bisogno della
 * stessa lista: due copie della stessa lista sarebbero divergute al primo
 * inserimento, ed è il difetto che `AGENTS.md` §3 (ondata 7, nota finale)
 * chiama per nome — *due definizioni dello stesso indicatore sono peggio di
 * nessun indicatore*. Il progetto già paga quel prezzo fra `rotte.mjs` e
 * `shots.mjs`; qui non si aggiunge.
 *
 * Il criterio della scelta è la **famiglia di composizione**, non l'importanza:
 * una pagina per ciascun impianto visivo, così una regressione di sistema si
 * vede almeno una volta. Aggiungerne una costa ~4s per tema e per viewport.
 */
export type PaginaCancello = {
  nome: string;
  url: string;
  /** Assente = pagina anonima. */
  conto?: { email: string; password: string };
};

export const PAGINE_ANONIME: PaginaCancello[] = [
  { nome: "login", url: "/login" },
  { nome: "valutazioni (barra anonima)", url: "/valutazioni" },
  { nome: "metodologia (documento lungo)", url: "/metodologia" },
];

export const PAGINE_AUTENTICATE: PaginaCancello[] = [
  { nome: "la mia città (hero + mesh)", url: "/la-mia-citta" },
  { nome: "bilancio (dati e grafici)", url: "/bilancio" },
  { nome: "segnalazioni (lista)", url: "/segnalazioni" },
  { nome: "quartieri (mesh coropletica)", url: "/quartieri" },
  { nome: "pagella (osservatorio)", url: "/pagella" },
];

/**
 * **Le superfici di lavoro dello staff, entrate il 2026-08-06** (Lavoro D §4).
 *
 * Erano fuori, e dichiarate: `login()` entra come cittadino, che su quelle
 * rotte **viene reindirizzato** — `requireAdmin()` non risponde 403, manda a
 * /la-mia-citta con stato 200 — quindi il cancello avrebbe misurato la home
 * col nome della pagina admin. Adesso ognuna entra col proprio ruolo, e la
 * trappola è chiusa da `pretendiAtterraggio()`: se il redirect ci porta
 * altrove il test fallisce invece di analizzare la pagina sbagliata.
 *
 * `/redazione` vuole MODERATORE e non admin, per disegno (R-4): il Comune non
 * modera ciò che lo riguarda.
 */
export const PAGINE_STAFF: PaginaCancello[] = [
  { nome: "area Comune (admin)", url: "/admin", conto: ADMIN },
  { nome: "codici QR (admin, da stampare)", url: "/admin/codici-qr", conto: ADMIN },
  { nome: "redazione (moderatore)", url: "/redazione", conto: MODERATORE },
];

/** Tutte e undici, nell'ordine in cui si attraversano. */
export const PAGINE_CANCELLO: PaginaCancello[] = [
  ...PAGINE_ANONIME,
  ...PAGINE_AUTENTICATE,
  ...PAGINE_STAFF,
];
