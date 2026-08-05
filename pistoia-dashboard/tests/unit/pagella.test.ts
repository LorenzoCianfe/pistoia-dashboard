import { describe, it, expect } from "vitest";
import {
  CONTROLLI,
  EDIZIONI,
  MATERIE_PAGELLA,
  SCADENZA_ART14,
  VOTO_MAX,
  VOTO_MIN,
  controlliDi,
  dataItaliana,
  esitiPubblicabili,
  materiaPagella,
  materieDi,
  votoMateria,
  votoPagella,
  type EdizionePagella,
  type EsitoControllo,
} from "@/lib/pagella";

/*
  Il modulo della pagella ha due regole che valgono più delle altre, e i test
  qui le fanno da guardiani:

  1. Il voto è un conteggio ricontabile (1 + 9 × quota), mai una stima.
  2. Un voto si pubblica solo INTERO: se anche un solo controllo della
     materia manca o non ha la fonte, il voto non esce (`null`).

  Più il guardiano del seed: `EDIZIONI` resta vuoto finché la prima
  ricognizione reale non esiste.
*/

const riga = (urlFonte = "https://example.gov.it/atto") => ({
  affermazione: "Esempio",
  fonte: "Atto di esempio",
  urlFonte,
  dataConsultazione: "2026-09-12",
});

const esitiCompleti = (
  materiaId: "trasparenza" | "spesa",
  superatoTutti = true,
): EsitoControllo[] =>
  controlliDi(materiaId).map((c) => ({
    controlloId: c.id,
    superato: superatoTutti,
    riga: riga(),
  }));

const edizione = (esiti: EsitoControllo[]): EdizionePagella => ({
  periodo: "2026-T3",
  dataConsultazioni: "2026-09-12",
  versioneMetodologia: "1.1",
  esiti,
});

describe("la formula: 1 + 9 × quota, ricontabile a mano", () => {
  it("gli estremi: zero superati fa 1, tutti fa 10", () => {
    expect(votoPagella(0, 7)).toBe(VOTO_MIN);
    expect(votoPagella(7, 7)).toBe(VOTO_MAX);
    expect(votoPagella(0, 3)).toBe(VOTO_MIN);
    expect(votoPagella(3, 3)).toBe(VOTO_MAX);
  });

  it("i casi del piano: 5 su 7 fa 7, 3 su 4 fa 8", () => {
    expect(votoPagella(5, 7)).toBe(7);
    expect(votoPagella(3, 4)).toBe(8);
  });

  it("un conteggio non valido è un errore di programma, non un dato", () => {
    expect(() => votoPagella(-1, 5)).toThrow();
    expect(() => votoPagella(6, 5)).toThrow();
    expect(() => votoPagella(1, 0)).toThrow();
    expect(() => votoPagella(1.5, 3)).toThrow();
  });
});

describe("il voto esce solo intero (regola 15)", () => {
  it("con tutti gli esiti pubblicabili, il voto si riconta", () => {
    const ed = edizione(esitiCompleti("trasparenza"));
    const v = votoMateria(ed, "trasparenza");
    expect(v).not.toBeNull();
    expect(v!.totale).toBe(controlliDi("trasparenza").length);
    expect(v!.superati).toBe(v!.totale);
    expect(v!.voto).toBe(VOTO_MAX);
  });

  it("se manca anche un solo esito, il voto NON esce", () => {
    const ed = edizione(esitiCompleti("trasparenza").slice(1));
    expect(votoMateria(ed, "trasparenza")).toBeNull();
  });

  it("un esito senza URL della fonte vale come mancante: niente voto", () => {
    const esiti = esitiCompleti("spesa");
    esiti[0] = { ...esiti[0], riga: riga("  ") };
    expect(votoMateria(edizione(esiti), "spesa")).toBeNull();
  });

  it("gli esiti dell'altra materia non entrano nel conteggio", () => {
    const ed = edizione([
      ...esitiCompleti("spesa", false),
      ...esitiCompleti("trasparenza"),
    ]);
    const v = votoMateria(ed, "spesa");
    expect(v).not.toBeNull();
    expect(v!.superati).toBe(0);
    expect(v!.voto).toBe(VOTO_MIN);
  });

  it("esitiPubblicabili scarta le righe senza URL, come vociPubblicabili", () => {
    const buono: EsitoControllo = {
      controlloId: "x",
      superato: true,
      riga: riga(),
    };
    const muto: EsitoControllo = {
      controlloId: "y",
      superato: true,
      riga: riga(""),
    };
    expect(esitiPubblicabili([buono, muto])).toEqual([buono]);
  });
});

describe("il guardiano del seed", () => {
  it("EDIZIONI è vuoto: la prima edizione nasce da una ricognizione reale, non dal seed", () => {
    // Quando P-3 scriverà la prima edizione vera (dopo il 27/08/2026),
    // questo test cambierà INSIEME a lei — mai prima.
    expect(EDIZIONI).toHaveLength(0);
  });
});

describe("materie e controlli: l'integrità del catalogo", () => {
  it("sei materie, ancore uniche, regimi validi", () => {
    expect(MATERIE_PAGELLA).toHaveLength(6);
    const ids = MATERIE_PAGELLA.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of MATERIE_PAGELLA) {
      expect(["voto", "fatti", "senza-fonte"]).toContain(m.regime);
      expect(m.descrizione.trim().length).toBeGreaterThan(0);
    }
  });

  it("i due regimi della composizione M1: 2 a voto, 1 a fatti, 3 senza fonte", () => {
    expect(materieDi("voto").map((m) => m.id)).toEqual([
      "trasparenza",
      "spesa",
    ]);
    expect(materieDi("fatti").map((m) => m.id)).toEqual(["promesse"]);
    expect(materieDi("senza-fonte")).toHaveLength(3);
  });

  it("una materia senza fonte dichiara che cosa la accenderebbe: mai un trattino muto", () => {
    for (const m of materieDi("senza-fonte")) {
      expect(m.cosaLaAccenderebbe?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it("ogni controllo appartiene a una materia a voto e cita la norma che fissa il traguardo", () => {
    const ids = CONTROLLI.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CONTROLLI) {
      const m = materiaPagella(c.materiaId);
      expect(m?.regime).toBe("voto");
      // Il traguardo lo fissa una norma, mai la Redazione: la stringa deve
      // citare un atto (D.Lgs, TUEL, …), non un'intenzione.
      expect(c.traguardoDi).toMatch(/D\.Lgs|TUEL/);
    }
  });

  it("ogni materia a voto ha almeno un controllo: senza, il suo voto non esisterebbe mai", () => {
    for (const m of materieDi("voto")) {
      expect(
        controlliDi(m.id as "trasparenza" | "spesa").length,
      ).toBeGreaterThan(0);
    }
  });
});

describe("le date", () => {
  it("dataItaliana rende il termine dell'art. 14 leggibile senza passare dai fusi", () => {
    expect(SCADENZA_ART14).toBe("2026-08-27");
    expect(dataItaliana(SCADENZA_ART14)).toBe("27 agosto 2026");
  });
});
