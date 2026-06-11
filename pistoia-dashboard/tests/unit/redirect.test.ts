import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/auth/redirect";

describe("safeNext (anti open-redirect)", () => {
  it("accetta percorsi relativi interni", () => {
    expect(safeNext("/bilancio")).toBe("/bilancio");
    expect(safeNext("/segnalazioni/abc?x=1")).toBe("/segnalazioni/abc?x=1");
  });

  it("rifiuta URL assoluti e protocol-relative", () => {
    expect(safeNext("https://evil.example")).toBe("/la-mia-citta");
    expect(safeNext("//evil.example")).toBe("/la-mia-citta");
    expect(safeNext("/\\evil.example")).toBe("/la-mia-citta");
    expect(safeNext("javascript:alert(1)")).toBe("/la-mia-citta");
  });

  it("rifiuta valori non-stringa o vuoti", () => {
    expect(safeNext(null)).toBe("/la-mia-citta");
    expect(safeNext("")).toBe("/la-mia-citta");
  });

  it("usa il fallback personalizzato", () => {
    expect(safeNext(null, "/login")).toBe("/login");
  });
});
