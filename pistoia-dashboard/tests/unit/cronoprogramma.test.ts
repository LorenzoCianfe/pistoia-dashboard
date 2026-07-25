import { describe, it, expect } from "vitest";
import {
  cronoprogramma,
  quotaInPari,
  scartoInParole,
  TOLLERANZA_IN_PARI,
} from "@/lib/cronoprogramma";

const ORA = new Date("2026-07-25T12:00:00Z").getTime();
const GIORNO = 24 * 60 * 60 * 1000;
const giorniFa = (n: number) => new Date(ORA - n * GIORNO);
const fraGiorni = (n: number) => new Date(ORA + n * GIORNO);

/** Un cantiere con calendario e avanzamento a scelta. */
const opera = (progress: number, iniziato: number, finisce: number) => ({
  progress,
  startedAt: giorniFa(iniziato),
  expectedEnd: fraGiorni(finisce),
});

describe("cronoprogramma — avanzamento contro calendario", () => {
  it("calcola tempo consumato, avanzamento e scarto", () => {
    // 100 giorni passati su 200 totali = metà calendario; 70% realizzato.
    const c = cronoprogramma(opera(70, 100, 100), ORA)!;
    expect(c.tempoConsumato).toBeCloseTo(0.5, 5);
    expect(c.avanzamento).toBeCloseTo(0.7, 5);
    expect(c.scarto).toBe(20);
    expect(c.andamento).toBe("avanti");
  });

  it("chiama «in ritardo» solo oltre la tolleranza, non a ogni punto di scarto", () => {
    // Esattamente sulla soglia: ancora in pari, non in ritardo.
    const alLimite = cronoprogramma(opera(50 - TOLLERANZA_IN_PARI, 100, 100), ORA)!;
    expect(alLimite.scarto).toBe(-TOLLERANZA_IN_PARI);
    expect(alLimite.andamento).toBe("in_pari");

    const oltre = cronoprogramma(opera(50 - TOLLERANZA_IN_PARI - 1, 100, 100), ORA)!;
    expect(oltre.andamento).toBe("in_ritardo");
  });

  it("è `null` quando il calendario non esiste, invece di inventarlo", () => {
    // Un'opera pianificata non ha un avvio.
    expect(
      cronoprogramma({ progress: 0, startedAt: null, expectedEnd: fraGiorni(300) }, ORA),
    ).toBeNull();
    // Una sospesa non ha una fine prevista.
    expect(
      cronoprogramma({ progress: 35, startedAt: giorniFa(260), expectedEnd: null }, ORA),
    ).toBeNull();
    // Durata non positiva: dato incoerente, non cantiere istantaneo.
    expect(
      cronoprogramma(
        { progress: 10, startedAt: giorniFa(10), expectedEnd: giorniFa(20) },
        ORA,
      ),
    ).toBeNull();
  });

  it("clampa il tempo alla scadenza e segnala che è passata", () => {
    // Fine prevista 30 giorni fa, lavori all'88%.
    const c = cronoprogramma(
      { progress: 88, startedAt: giorniFa(300), expectedEnd: giorniFa(30) },
      ORA,
    )!;
    expect(c.tempoConsumato).toBe(1);
    expect(c.scarto).toBe(-12);
    expect(c.scaduto).toBe(true);
  });

  it("non dichiara scaduta un'opera finita dopo la scadenza", () => {
    const c = cronoprogramma(
      { progress: 100, startedAt: giorniFa(400), expectedEnd: giorniFa(20) },
      ORA,
    )!;
    expect(c.scaduto).toBe(false);
  });

  it("descrive lo scarto senza ripetere il verdetto", () => {
    const c = cronoprogramma(opera(70, 100, 100), ORA)!;
    expect(scartoInParole(c)).toBe("70% realizzato, 50% di tempo trascorso");
  });
});

describe("quotaInPari — la salute che tinge la superficie mesh", () => {
  it("conta in pari anche chi è avanti, e ignora chi non ha calendario", () => {
    const q = quotaInPari(
      [
        opera(70, 100, 100), // avanti
        opera(50, 100, 100), // in pari
        opera(20, 100, 100), // in ritardo
        { progress: 0, startedAt: null, expectedEnd: fraGiorni(90) }, // escluso
      ],
      ORA,
    );
    expect(q.misurabili).toBe(3);
    expect(q.inPari).toBe(2);
    expect(q.esclusi).toBe(1);
    expect(q.percentuale).toBe(67);
  });

  it("senza cantieri misurabili la percentuale non è zero: non esiste", () => {
    const q = quotaInPari(
      [{ progress: 0, startedAt: null, expectedEnd: null }],
      ORA,
    );
    expect(q.misurabili).toBe(0);
    expect(q.percentuale).toBeNull();
  });
});
