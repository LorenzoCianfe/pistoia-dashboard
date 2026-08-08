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
/**
 * Come si arriva a una rotta di DETTAGLIO, il cui indirizzo non è fisso.
 *
 * Gli id vengono dal seed e cambiano a ogni `db:seed`, quindi non si possono
 * scrivere qui: si apre la lista (`url`) e si clicca la prima riga. È la stessa
 * tecnica che `scripts/shots.mjs` usa da sempre per i dettagli pubblici e che
 * `scripts/rotte.mjs` chiama `DETTAGLI`.
 */
export type ApriPrima = { selettore: string; attendi: RegExp };

export type PaginaCancello = {
  nome: string;
  url: string;
  /** Assente = pagina anonima. */
  conto?: { email: string; password: string };
  /** Presente = `url` è la lista, e la pagina da misurare è quella che si apre. */
  apriPrima?: ApriPrima;
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
  { nome: "area Comune (admin, cruscotto)", url: "/admin", conto: ADMIN },
  { nome: "codici QR (admin, da stampare)", url: "/admin/codici-qr", conto: ADMIN },
  /*
    LE SEI SOTTOPAGINE DEL COMUNE, entrate il 2026-08-07 col taglio di `/admin`
    (`docs/piano-admin.md`).

    Entrano **tutte e sei**, e non è zelo: sono i componenti che questo cancello
    già misurava ieri dentro l'unica `/admin` — triage, verifiche, moderazione,
    risposte, i tre strumenti. Sceglierne due «rappresentative» non
    risparmierebbe una verifica nuova: **toglierebbe copertura che esiste**, e
    §2 dice che l'accessibilità non si regredisce.

    Il costo, dichiarato: ~4s per pagina, per tema e per viewport, sui due
    cancelli che leggono questa lista.
  */
  { nome: "admin · valutazioni", url: "/admin/valutazioni", conto: ADMIN },
  { nome: "admin · proposte", url: "/admin/proposte", conto: ADMIN },
  { nome: "admin · domande", url: "/admin/domande", conto: ADMIN },
  { nome: "admin · segnalazioni (triage)", url: "/admin/segnalazioni", conto: ADMIN },
  { nome: "admin · cittadini (verifiche + moderazione)", url: "/admin/cittadini", conto: ADMIN },
  { nome: "admin · pubblica (i tre strumenti)", url: "/admin/pubblica", conto: ADMIN },
  /*
    I QUATTRO DETTAGLI DELLE CODE, entrati il 2026-08-07 con «lista + dettaglio»
    (`docs/piano-admin.md` §6).

    Entrano tutti e quattro, e per la stessa ragione delle sei sottopagine: i
    moduli che questo cancello misurava ieri sulle liste — triage, valutazione
    della proposta, risposta alla domanda, controlli sulla recensione — **oggi
    vivono qui**. Elencarne uno solo «rappresentativo» non risparmierebbe una
    verifica nuova: toglierebbe copertura che esiste, su quattro moduli diversi.

    Il guscio a due colonne è invece lo stesso per tutti e quattro, e questo il
    cancello lo misura quattro volte: è il prezzo di non perdere i moduli.
  */
  {
    nome: "admin · segnalazione (dettaglio)",
    url: "/admin/segnalazioni",
    conto: ADMIN,
    apriPrima: {
      selettore: 'a[href^="/admin/segnalazioni/"]',
      attendi: /\/admin\/segnalazioni\/[^/]+$/,
    },
  },
  {
    nome: "admin · proposta (dettaglio)",
    url: "/admin/proposte",
    conto: ADMIN,
    apriPrima: {
      selettore: 'a[href^="/admin/proposte/"]',
      attendi: /\/admin\/proposte\/[^/]+$/,
    },
  },
  {
    nome: "admin · domanda (dettaglio)",
    url: "/admin/domande",
    conto: ADMIN,
    apriPrima: {
      selettore: 'a[href^="/admin/domande/"]',
      attendi: /\/admin\/domande\/[^/]+$/,
    },
  },
  {
    nome: "admin · recensione (dettaglio)",
    url: "/admin/valutazioni",
    conto: ADMIN,
    apriPrima: {
      selettore: 'a[href^="/admin/valutazioni/"]',
      attendi: /\/admin\/valutazioni\/[^/]+$/,
    },
  },
  { nome: "redazione (moderatore)", url: "/redazione", conto: MODERATORE },
];

/** Tutte e ventuno, nell'ordine in cui si attraversano. */
export const PAGINE_CANCELLO: PaginaCancello[] = [
  ...PAGINE_ANONIME,
  ...PAGINE_AUTENTICATE,
  ...PAGINE_STAFF,
];
