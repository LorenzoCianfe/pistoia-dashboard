// Helper puri per gli indicatori "Stato della città" (O3).
// Separati dal data layer (server-only + Prisma) per essere unit-testabili.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Definizione del tasso di risoluzione, in un posto solo.
 *
 * Sta qui e non dentro le due query che lo calcolano — "Stato della città" e i
 * quartieri — perché due definizioni leggermente diverse dello stesso indicatore
 * sono peggio di nessun indicatore: la stessa città risulterebbe al 71% in home
 * e al 64% sulla pagina dei quartieri, e nessuno saprebbe quale credere.
 */

/** Stati che contano come problema risolto. */
export const STATI_RISOLTI = ["risolta"] as const;

/**
 * Stati esclusi dal denominatore: un duplicato o una cosa che non compete al
 * Comune non è un problema che il Comune abbia mancato di risolvere.
 */
export const STATI_FUORI_CONTEGGIO = ["duplicata", "non_di_competenza"] as const;

/** Stati che contano come segnalazione ancora aperta. */
export const STATI_CHIUSI = [
  "risolta",
  "chiusa",
  "non_di_competenza",
  "duplicata",
] as const;

/** 0–100, oppure `null`: con zero segnalazioni il tasso non è "0%", non esiste. */
export function tassoRisoluzione(
  risolte: number,
  totaleConteggiabile: number,
): number | null {
  if (totaleConteggiabile <= 0) return null;
  return Math.round((risolte / totaleConteggiabile) * 100);
}

/**
 * Sotto questo numero di segnalazioni un tasso non è una media, è rumore.
 *
 * Serve dove il tasso diventa un GIUDIZIO a colori — le schede dei quartieri.
 * Con due segnalazioni aperte un'area risulta "0% risolte" e si tinge di rosso:
 * la percentuale è aritmeticamente esatta e non significa niente, ma il colore
 * la fa leggere come un'accusa. Su una piattaforma del Comune quel colore
 * peserebbe su un quartiere reale.
 *
 * Cinque è basso di proposito: alza la soglia quel tanto che basta a togliere i
 * casi da uno o due, senza pretendere una significatività statistica che una
 * città non raggiungerebbe mai quartiere per quartiere.
 */
export const CAMPIONE_MINIMO_PER_GIUDIZIO = 5;

/** Vero se il tasso di quell'area regge un giudizio a colori. */
export function tassoGiudicabile(totaleConteggiabile: number): boolean {
  return totaleConteggiabile >= CAMPIONE_MINIMO_PER_GIUDIZIO;
}

/** Conta le date in bucket settimanali, dal più vecchio al più recente. */
export function weeklyBuckets(dates: Date[], now: Date, weeks: number): number[] {
  const out = new Array<number>(weeks).fill(0);
  for (const d of dates) {
    const age = now.getTime() - d.getTime();
    if (age < 0) continue;
    const idx = Math.floor(age / WEEK_MS);
    if (idx < weeks) out[weeks - 1 - idx] += 1;
  }
  return out;
}

/**
 * Etichette dei bucket di `weeklyBuckets`, nello stesso ordine.
 * Ogni etichetta è il giorno di INIZIO della settimana, es. "12 mag".
 */
export function weeklyLabels(now: Date, weeks: number): string[] {
  const fmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });
  return Array.from({ length: weeks }, (_, i) =>
    fmt.format(new Date(now.getTime() - (weeks - 1 - i) * WEEK_MS)),
  );
}
