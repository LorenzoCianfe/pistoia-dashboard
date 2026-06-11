import { describe, expect, it } from "vitest";
import { findBlockedIn } from "@/lib/word-filter";

describe("findBlockedIn (filtro parole bloccate, §14)", () => {
  it("trova la parola come parola intera, case-insensitive", () => {
    expect(findBlockedIn("Che SPAM incredibile", ["spam"])).toBe("spam");
    expect(findBlockedIn("testo pulito", ["spam"])).toBeNull();
  });

  it("non scatta su sottostringhe dentro altre parole", () => {
    // "rom" non deve scattare dentro "romanzo"
    expect(findBlockedIn("un bel romanzo", ["rom"])).toBeNull();
    expect(findBlockedIn("rom !", ["rom"])).toBe("rom");
  });

  it("gestisce punteggiatura e confini di riga", () => {
    expect(findBlockedIn("spam.", ["spam"])).toBe("spam");
    expect(findBlockedIn("(spam)", ["spam"])).toBe("spam");
    expect(findBlockedIn("spam", ["spam"])).toBe("spam");
  });

  it("escapa i metacaratteri regex nelle parole", () => {
    expect(findBlockedIn("testo con c++ dentro", ["c++"])).toBe("c++");
    expect(() => findBlockedIn("x", ["(", "[", "*"])).not.toThrow();
  });

  it("lista vuota o parole vuote: mai match", () => {
    expect(findBlockedIn("qualsiasi testo", [])).toBeNull();
    expect(findBlockedIn("qualsiasi testo", [""])).toBeNull();
  });
});
