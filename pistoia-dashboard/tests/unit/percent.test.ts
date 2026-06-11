import { describe, expect, it } from "vitest";
import { toPercents } from "@/lib/percent";

describe("toPercents (largest remainder)", () => {
  it("somma sempre esattamente a 100", () => {
    const cases = [
      [1, 1, 1],
      [33, 33, 33],
      [2, 3, 5, 7, 11],
      [999, 1],
      [10, 20, 30, 40],
      [7, 7, 7, 7, 7, 7, 7],
    ];
    for (const values of cases) {
      const p = toPercents(values);
      expect(p.reduce((s, v) => s + v, 0), `input ${values}`).toBe(100);
    }
  });

  it("gestisce il caso 33/33/33 senza arrivare a 99", () => {
    expect(toPercents([1, 1, 1]).reduce((s, v) => s + v, 0)).toBe(100);
  });

  it("restituisce 0 per ogni voce quando il totale è zero", () => {
    expect(toPercents([0, 0, 0])).toEqual([0, 0, 0]);
    expect(toPercents([])).toEqual([]);
  });

  it("dà il 100% a un'unica voce", () => {
    expect(toPercents([42])).toEqual([100]);
  });

  it("mantiene le proporzioni (la voce più votata ha la % più alta)", () => {
    const p = toPercents([80, 15, 5]);
    expect(p[0]).toBeGreaterThan(p[1]);
    expect(p[1]).toBeGreaterThan(p[2]);
    expect(p).toEqual([80, 15, 5]);
  });
});
