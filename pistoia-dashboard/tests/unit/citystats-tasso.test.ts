import { describe, it, expect } from "vitest";
import {
  CAMPIONE_MINIMO_PER_GIUDIZIO,
  STATI_CHIUSI,
  STATI_FUORI_CONTEGGIO,
  STATI_RISOLTI,
  campioneSufficiente,
  tassoGiudicabile,
  tassoRisoluzione,
} from "@/lib/citystats";

describe("tasso di risoluzione — una definizione sola", () => {
  it("arrotonda all'intero", () => {
    expect(tassoRisoluzione(7, 10)).toBe(70);
    expect(tassoRisoluzione(1, 3)).toBe(33);
  });

  it("con denominatore a zero non è 0%: è un dato che non esiste", () => {
    expect(tassoRisoluzione(0, 0)).toBeNull();
    expect(tassoRisoluzione(0, 10)).toBe(0);
  });

  it("difende il denominatore da negativi", () => {
    expect(tassoRisoluzione(3, -1)).toBeNull();
  });

  it("gli stati fuori conteggio sono tutti anche stati chiusi", () => {
    // Se un giorno divergessero, una segnalazione potrebbe risultare aperta e
    // insieme esclusa dal denominatore: sparirebbe da entrambe le letture.
    for (const s of STATI_FUORI_CONTEGGIO) {
      expect(STATI_CHIUSI).toContain(s);
    }
  });

  it("uno stato risolto non può essere fuori conteggio", () => {
    for (const s of STATI_RISOLTI) {
      expect(STATI_FUORI_CONTEGGIO).not.toContain(s);
      expect(STATI_CHIUSI).toContain(s);
    }
  });
});

describe("campione minimo — una soglia sola per ogni giudizio", () => {
  it("taglia sotto la soglia e passa da lì in su", () => {
    expect(campioneSufficiente(CAMPIONE_MINIMO_PER_GIUDIZIO - 1)).toBe(false);
    expect(campioneSufficiente(CAMPIONE_MINIMO_PER_GIUDIZIO)).toBe(true);
    expect(campioneSufficiente(CAMPIONE_MINIMO_PER_GIUDIZIO + 1)).toBe(true);
  });

  it("un campione vuoto o negativo non regge nessun giudizio", () => {
    expect(campioneSufficiente(0)).toBe(false);
    expect(campioneSufficiente(-3)).toBe(false);
  });

  it("`tassoGiudicabile` non è una seconda soglia, è la stessa", () => {
    // Se un giorno divergessero, la stessa città avrebbe due idee di «quando un
    // rapporto può essere presentato come un verdetto» — esattamente il difetto
    // che il tasso di risoluzione unificato è nato per togliere (AGENTS.md §3).
    for (let n = 0; n <= CAMPIONE_MINIMO_PER_GIUDIZIO + 3; n++) {
      expect(tassoGiudicabile(n)).toBe(campioneSufficiente(n));
    }
  });
});
