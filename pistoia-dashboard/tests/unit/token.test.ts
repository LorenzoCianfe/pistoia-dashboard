import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { idValido, tokenValido } from "@/lib/token";

/*
  Il difetto che questo modulo chiude non è un caso limite: è che
  `deleteMany({ where: { token: undefined } })` **cancella tutta la tabella**
  invece di zero righe, perché Prisma lascia cadere i campi indefiniti e resta
  un filtro vuoto. Misurato il 2026-08-08 sul database di sviluppo, in una
  transazione ribaltata: tre righe su tre.

  Quindi i casi che contano qui non sono le stringhe strane: sono `undefined`,
  `null` e la stringa vuota — cioè ciò che arriva quando una Server Action
  viene invocata senza i suoi argomenti. Una Server Action è un endpoint HTTP
  pubblico, e la firma TypeScript non vale al confine di rete.
*/

const NIENTE = [undefined, null, "", 0, false, NaN, {}, [], () => {}];

describe("tokenValido", () => {
  it("accetta i token che generiamo davvero", () => {
    // Le due lunghezze in uso: valutazioni (24 byte) e promemoria (18).
    for (const byte of [18, 24]) {
      for (let i = 0; i < 50; i++) {
        expect(tokenValido(randomBytes(byte).toString("base64url"))).toBe(true);
      }
    }
  });

  it("rifiuta tutto ciò che arriva da un'azione invocata senza argomenti", () => {
    for (const v of NIENTE) expect(tokenValido(v)).toBe(false);
  });

  it("rifiuta le forme che non sono base64url", () => {
    expect(tokenValido("token con spazi ma lungo abbastanza")).toBe(false);
    expect(tokenValido("caratteri/non+base64url/xxxxxxxx")).toBe(false);
    expect(tokenValido("corto")).toBe(false);
    expect(tokenValido("x".repeat(65))).toBe(false);
  });
});

describe("idValido", () => {
  it("accetta i cuid che il database produce", () => {
    for (const id of [
      "cmsjedl7300635glw1ny1kj3f",
      "cmsjedl3a001r5glwf4e29iej",
      "cmsjedlau008x5glwb42zcsh1",
    ]) {
      expect(idValido(id)).toBe(true);
    }
  });

  it("rifiuta tutto ciò che arriva da un'azione invocata senza argomenti", () => {
    for (const v of NIENTE) expect(idValido(v)).toBe(false);
  });

  it("rifiuta gli slug, che non sono id", () => {
    // `FollowButton` passa sempre `n.id`, mai `n.slug`: se un giorno cambiasse,
    // questo test dice che la guardia va cambiata insieme.
    expect(idValido("centro")).toBe(false);
    expect(idValido("porta-al-borgo")).toBe(false);
  });
});
