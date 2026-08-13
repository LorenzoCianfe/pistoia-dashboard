/**
 * LA PRIMA PAGINA — la parte pura: chi apre, come si valida ciò che la redazione
 * scrive, e le tre righe del numero-monumento.
 *
 * Modulo **neutro** di proposito (niente `"use client"`, niente `server-only`):
 * lo importano la pagina e la superficie redazionale, che sono Server
 * Component, l'azione che salva, e i test. In un file client le costanti
 * diventerebbero riferimenti client per chi le importa da server, e l'aggancio
 * sparirebbe senza un errore (`AGENTS.md` §3, ondata 6/5).
 *
 * La query che porta i dati sta in `lib/data/atti.ts`; qui non c'è niente che
 * non si possa provare con un test.
 */

import {
  MENSILITA,
  vociPubblicabili,
  type Voce,
} from "./costo-amministrazione";

// ---------------------------------------------------------------------------
// Il fatto del giorno
// ---------------------------------------------------------------------------

/**
 * Il minimo che serve per decidere chi apre la prima pagina. Volutamente più
 * stretto dell'atto intero: questa funzione decide, non disegna.
 */
export type CandidatoApertura = {
  /** L'identità dell'atto (`lib/atti.ts`): serve a rendere l'ordinamento TOTALE. */
  chiave: string;
  titoloRedazionale: string | null;
  curatoIl: Date | null;
};

/**
 * Un atto è curato quando porta un **titolo umano non vuoto**, e basta quello.
 *
 * L'invariante è sul titolo e non su `curatoIl` di proposito: `curatoIl` è
 * metadato di visualizzazione — dice *quando* — e due sorgenti di verità per
 * «è curato?» divergono al primo salvataggio scritto a mano o da una
 * migrazione. Il sommario resta facoltativo: è corredo, e `DESIGN.md` §8 dice
 * che il corredo si aggiunge solo quando dice qualcosa.
 */
export function attoCurato(a: Pick<CandidatoApertura, "titoloRedazionale">): boolean {
  return (a.titoloRedazionale ?? "").trim().length > 0;
}

/**
 * Chi apre la prima pagina, fra gli atti di un giorno — oppure **nessuno**.
 *
 * 🔴 **Senza cura non c'è apertura** (decisione di Lorenzo, 2026-08-12). Se in
 * un giorno nessuno ha curato niente, questa funzione restituisce `null` e la
 * home apre col fiume degli atti e col numero-monumento, **senza fingere
 * un'apertura**: un'apertura vuota è peggio di nessuna apertura.
 *
 * Non c'è nessun ripiego sul giorno precedente, ed è la parte che conta: un
 * fatto curato ieri, presentato oggi come «il fatto del giorno», sarebbe
 * esattamente la finzione che la decisione vieta. La data del giorno è scritta
 * in chiaro nella striscia, quindi la home non afferma mai «oggi» a sproposito.
 *
 * Fra due atti curati lo stesso giorno vince **l'ultimo curato**: è la scelta
 * più recente della redazione, cioè un ripensamento che deve poter vincere
 * senza dover disfare il primo.
 */
export function fattoDelGiorno<T extends CandidatoApertura>(
  candidati: readonly T[],
): T | null {
  const curati = candidati.filter(attoCurato);
  if (curati.length === 0) return null;

  // L'ordinamento dev'essere TOTALE, altrimenti due atti curati nello stesso
  // istante darebbero una prima pagina che cambia da un caricamento all'altro.
  // `curatoIl` nullo va in fondo: un titolo senza timbro è comunque curato
  // (l'invariante è sul titolo), ma è il candidato più debole.
  return [...curati].sort((a, b) => {
    const qa = a.curatoIl?.getTime() ?? -Infinity;
    const qb = b.curatoIl?.getTime() ?? -Infinity;
    if (qa !== qb) return qb - qa;
    return a.chiave.localeCompare(b.chiave);
  })[0];
}

// ---------------------------------------------------------------------------
// Che cosa la redazione può scrivere
// ---------------------------------------------------------------------------

/**
 * Un titolo umano sta in due righe di prima pagina. Il metro non è astratto: il
 * titolo montato sui mockup — «La scuola "Raffaello" avrà un involucro nuovo,
 * per consumare meno» — ne misura 64, e l'oggetto ufficiale che sostituisce ne
 * misura in mediana **245** (p90 428, massimo 736, misurati sui 500 atti più
 * recenti di `dev.db`). 120 lascia respiro a un titolo lungo e ferma un
 * paragrafo.
 */
export const TITOLO_MAX = 120;

/** La didascalia è una-due frasi, non un articolo: la redazione è una persona sola. */
export const SOMMARIO_MAX = 320;

export type EsitoCura =
  | { ok: true; titolo: string; sommario: string | null }
  | { ok: false; problema: string };

/**
 * Valida ciò che la redazione scrive, **prima** che arrivi al database.
 *
 * Non c'è una lunghezza minima, ed è una scelta: un minimo inventato («almeno
 * 12 caratteri») non distingue un titolo buono da uno cattivo — respinge solo
 * chi sta scrivendo. Il controllo che invece ha un senso è il terzo, e nasce
 * dal problema che questo campo esiste per risolvere: **se il titolo umano è
 * l'oggetto ufficiale ricopiato, non è un titolo** — è la barriera che si
 * voleva togliere dalla cima della prima pagina, rimessa lì a mano.
 *
 * ⚠️ Gli argomenti di una Server Action sono **input non fidato**: l'azione è un
 * endpoint HTTP pubblico e la firma TypeScript non vale al confine di rete
 * (`AGENTS.md` §3, 2026-08-08). Questa funzione si chiama prima della query,
 * non dentro.
 */
export function validaCura(
  titoloGrezzo: unknown,
  sommarioGrezzo: unknown,
  oggettoUfficiale: string,
): EsitoCura {
  if (typeof titoloGrezzo !== "string") return { ok: false, problema: "Il titolo manca." };
  if (sommarioGrezzo !== undefined && sommarioGrezzo !== null && typeof sommarioGrezzo !== "string") {
    return { ok: false, problema: "La didascalia non è un testo." };
  }

  const titolo = titoloGrezzo.trim();
  const sommario = (typeof sommarioGrezzo === "string" ? sommarioGrezzo : "").trim();

  if (titolo.length === 0) return { ok: false, problema: "Il titolo non può essere vuoto." };
  if (titolo.length > TITOLO_MAX) {
    return { ok: false, problema: `Il titolo supera i ${TITOLO_MAX} caratteri (ne ha ${titolo.length}).` };
  }
  if (sommario.length > SOMMARIO_MAX) {
    return { ok: false, problema: `La didascalia supera i ${SOMMARIO_MAX} caratteri (ne ha ${sommario.length}).` };
  }
  if (normalizza(titolo) === normalizza(oggettoUfficiale)) {
    return {
      ok: false,
      problema:
        "Il titolo è l'oggetto ufficiale ricopiato. L'oggetto resta comunque visibile sotto: qui serve la frase che lo spiega.",
    };
  }

  return { ok: true, titolo, sommario: sommario.length > 0 ? sommario : null };
}

/** Minuscole e spazi normalizzati: il confronto guarda il testo, non la battitura. */
function normalizza(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Il numero-monumento
// ---------------------------------------------------------------------------

/**
 * Una riga del monumento: **chi**, **come ci è arrivato**, **quanto**.
 *
 * 🔴 **Il partito NON c'è, ed è misurato** (`docs/fonti-organigramma.md` §2.2):
 * quattro assessori su otto non compaiono in nessuna delle dodici liste, perché
 * gli assessori li nomina il sindaco (TUEL art. 46 c. 2). Dare il partito a chi
 * ce l'ha e lasciare vuoto agli altri **non è neutro**: quel vuoto si legge
 * «questi non li ha votati nessuno», che è falso.
 *
 * Al suo posto c'è `accesso`, che è vero per tutte e nove le persone e dice al
 * cittadino la cosa che conta davvero: **chi ha votato, e chi no.**
 */
export type RigaMonumento = {
  /** Il nome, o «7 assessori» dove le persone sono raggruppate. */
  chi: string;
  carica: string;
  /** Come si arriva alla carica. Mai il partito: vedi sopra. */
  accesso: string;
  importoMensile: number;
  /** Quante persone porta la riga: 1, 1 e 7. Serve a far tornare il totale. */
  quante: number;
};

/**
 * Come si arriva a ciascuna carica, in tre parole.
 *
 * Le fonti sono già in casa e non si duplicano qui: `lib/giunta.ts` porta
 * l'`insediamento` esteso di ognuna delle nove persone, con la scheda del
 * Comune che lo dichiara. Questa tabella è la sua forma **corta**, per una riga
 * di prima pagina — stesso fatto, meno parole.
 *
 * Il presidente del consiglio non è qui perché non è in giunta e non entra nel
 * monumento: una voce in più «per completezza» sarebbe una frase che nessuna
 * riga di questo file usa, cioè un'affermazione mai verificata da nessun test.
 */
const ACCESSO: Record<string, string> = {
  sindaco: "eletto dai cittadini",
  vicesindaca: "nominata dal sindaco",
  assessore: "nominati dal sindaco",
};

/**
 * Le tre righe del monumento — sindaco, vicesindaca, «7 assessori».
 *
 * Si costruisce da `vociPubblicabili()` e non dall'elenco grezzo: una voce che
 * perdesse la fonte sparirebbe dalla pagina *e* dal totale insieme, che è la
 * regola di `costo-amministrazione.ts`. Costruirla altrimenti farebbe comparire
 * in prima pagina una cifra costruita anche su ciò che la piattaforma si è
 * rifiutata di mostrare.
 */
export function righeMonumento(voci?: Voce[]): RigaMonumento[] {
  const inGiunta = vociPubblicabili(voci).filter((v) => v.inGiunta);
  const righe: RigaMonumento[] = [];

  for (const ruolo of ["sindaco", "vicesindaca"] as const) {
    const v = inGiunta.find((x) => x.ruolo === ruolo);
    if (v) {
      righe.push({
        chi: v.persona,
        carica: v.carica,
        accesso: ACCESSO[ruolo],
        importoMensile: v.importoMensile,
        quante: 1,
      });
    }
  }

  const assessori = inGiunta.filter((v) => v.ruolo === "assessore");
  if (assessori.length > 0) {
    righe.push({
      // Raggruppati perché la prima pagina ha tre righe, non nove: i nomi uno
      // per uno stanno su `/trasparenza/costo-amministrazione`, che è la pagina
      // il cui mestiere è quello.
      chi: `${assessori.length} assessori`,
      carica: assessori.length === 1 ? "Assessore" : "Assessori",
      accesso: ACCESSO.assessore,
      // Tutti alla stessa quota di legge (60%): l'importo è quello, non una media.
      importoMensile: assessori[0].importoMensile,
      quante: assessori.length,
    });
  }

  return righe;
}

/**
 * Il costo annuo che le righe del monumento dichiarano.
 *
 * Esiste per essere confrontato con `costoAnnuoGiunta()` da un test: se le due
 * cifre divergono, la prima pagina sta mostrando un totale che le sue stesse
 * righe non spiegano — ed è il difetto che nessuno noterebbe guardando.
 */
export function totaleAnnuoDalleRighe(righe: RigaMonumento[]): number {
  return righe.reduce((tot, r) => tot + r.importoMensile * r.quante, 0) * MENSILITA;
}
