/**
 * Avanzamento contro calendario — la domanda che un cittadino fa davvero a un
 * cantiere: «sta rispettando i tempi?».
 *
 * Nessun campo lo dichiara. Si deriva da `startedAt`, `expectedEnd` e
 * `progress`, che sono dati reali: la quota di calendario già consumata contro
 * la quota di lavoro già fatta. Lo scarto fra le due è tutta l'informazione.
 *
 * **Quando il calendario non si può calcolare la funzione torna `null`**, e
 * questo è il punto delicato: un'opera pianificata non ha un avvio, una sospesa
 * non ha una fine prevista. Riempire il buco con "oggi" produrrebbe uno scarto
 * finto, indistinguibile a vista da uno vero — e su un cantiere in ritardo
 * sarebbe una bugia con la faccia di un dato. Meglio dichiarare l'esclusione.
 */

export type Andamento = "avanti" | "in_pari" | "in_ritardo";

export type Cronoprogramma = {
  /** Quota di calendario consumata, 0–1. Clampata: oltre la scadenza resta 1. */
  tempoConsumato: number;
  /** Avanzamento dichiarato dall'ufficio, 0–1. */
  avanzamento: number;
  /** Scarto in punti percentuali. Positivo = più avanti del calendario. */
  scarto: number;
  andamento: Andamento;
  /** Vero se la fine prevista è già passata e l'opera non è chiusa. */
  scaduto: boolean;
};

/**
 * Sotto i 5 punti lo scarto è rumore, non un segnale: le percentuali di
 * avanzamento sono stime dell'ufficio tecnico, non misure. Chiamare "in
 * ritardo" un cantiere per due punti significherebbe leggere l'arrotondamento.
 */
export const TOLLERANZA_IN_PARI = 5;

export const ANDAMENTO: Record<Andamento, { label: string; color: string }> = {
  avanti: { label: "Avanti sul calendario", color: "green" },
  in_pari: { label: "In pari", color: "teal" },
  in_ritardo: { label: "Indietro sul calendario", color: "amber" },
};

type OperaCalendario = {
  progress: number;
  startedAt: Date | null;
  expectedEnd: Date | null;
};

export function cronoprogramma(
  o: OperaCalendario,
  now: number = Date.now(),
): Cronoprogramma | null {
  if (!o.startedAt || !o.expectedEnd) return null;

  const inizio = o.startedAt.getTime();
  const fine = o.expectedEnd.getTime();
  // Durata non positiva: il dato è incoerente, non è un cantiere a durata zero.
  if (fine <= inizio) return null;

  const grezzo = (now - inizio) / (fine - inizio);
  const tempoConsumato = Math.min(Math.max(grezzo, 0), 1);
  const avanzamento = Math.min(Math.max(o.progress, 0), 100) / 100;
  const scarto = Math.round((avanzamento - tempoConsumato) * 100);

  return {
    tempoConsumato,
    avanzamento,
    scarto,
    andamento:
      scarto > TOLLERANZA_IN_PARI
        ? "avanti"
        : scarto < -TOLLERANZA_IN_PARI
          ? "in_ritardo"
          : "in_pari",
    scaduto: grezzo > 1 && o.progress < 100,
  };
}

/**
 * Le due quantità che l'etichetta di `ANDAMENTO` riassume, dette per esteso.
 *
 * Volutamente fattuale e senza giudizio: il verdetto lo porta già l'etichetta,
 * e ripeterlo qui ("In pari · procede sul calendario") suona come due frasi che
 * dicono la stessa cosa perché nessuna delle due dice abbastanza.
 */
export function scartoInParole(c: Cronoprogramma): string {
  const fatto = Math.round(c.avanzamento * 100);
  const tempo = Math.round(c.tempoConsumato * 100);
  return `${fatto}% realizzato, ${tempo}% di tempo trascorso`;
}

export type QuotaInPari = {
  /** Cantieri in pari o avanti. */
  inPari: number;
  /** Cantieri per cui il calendario è calcolabile. */
  misurabili: number;
  /** Cantieri esclusi perché senza avvio o senza fine prevista. */
  esclusi: number;
  /** Percentuale 0–100 sui soli misurabili. `null` se non ce n'è nessuno. */
  percentuale: number | null;
};

/**
 * La salute d'insieme dei cantieri: quanti rispettano il proprio calendario.
 *
 * È una salute vera, quindi può tingere una `MeshSurface` senza mentire —
 * diversamente dall'avanzamento medio, che sembra una salute e non lo è: un
 * cantiere al 18% appena aperto non è "in affanno", è nuovo.
 */
export function quotaInPari(
  opere: OperaCalendario[],
  now: number = Date.now(),
): QuotaInPari {
  let inPari = 0;
  let misurabili = 0;

  for (const o of opere) {
    const c = cronoprogramma(o, now);
    if (!c) continue;
    misurabili++;
    if (c.andamento !== "in_ritardo") inPari++;
  }

  return {
    inPari,
    misurabili,
    esclusi: opere.length - misurabili,
    percentuale: misurabili > 0 ? Math.round((inPari / misurabili) * 100) : null,
  };
}
