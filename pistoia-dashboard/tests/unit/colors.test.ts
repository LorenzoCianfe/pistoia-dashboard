import { describe, expect, it } from "vitest";
import { ACCENTS, accent, accentFromString, initialsOf } from "@/lib/colors";

describe("accentFromString", () => {
  it("è deterministico e restituisce sempre un accent valido", () => {
    for (const name of ["Lorenzo", "Maria Rossi", "x", "", "Comune di Pistoia"]) {
      const a = accentFromString(name);
      expect(accentFromString(name)).toBe(a);
      expect(ACCENTS).toContain(a);
    }
  });
});

describe("accent", () => {
  it("ricade su teal per token sconosciuti", () => {
    expect(accent("non-esiste")).toEqual(accent("teal"));
  });
});

describe("initialsOf", () => {
  it("usa prima e ultima parola", () => {
    expect(initialsOf("Marco Gentili")).toBe("MG");
    expect(initialsOf("Anna Maria De Luca")).toBe("AL");
  });
  it("gestisce nomi singoli e vuoti", () => {
    expect(initialsOf("Pistoia")).toBe("PI");
    expect(initialsOf("  ")).toBe("?");
  });
});
