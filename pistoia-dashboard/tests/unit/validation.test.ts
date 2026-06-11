import { describe, expect, it } from "vitest";
import {
  signupSchema,
  loginSchema,
  estimatePasswordStrength,
} from "@/lib/auth/validation";

describe("signupSchema", () => {
  it("normalizza l'email (trim + lowercase)", () => {
    const r = signupSchema.safeParse({
      name: "Lorenzo",
      email: "  Lorenzo@PISTOIA.it ",
      password: "password123",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("lorenzo@pistoia.it");
  });

  it("rifiuta password troppo corte o senza numeri/lettere", () => {
    const base = { name: "Lorenzo", email: "a@b.it" };
    expect(signupSchema.safeParse({ ...base, password: "corta1" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, password: "solo-lettere-qui" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, password: "1234567890123" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, password: "lettere-e-1" }).success).toBe(true);
  });

  it("rifiuta nomi troppo corti ed email non valide", () => {
    expect(
      signupSchema.safeParse({ name: "L", email: "a@b.it", password: "password123" }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({ name: "Lorenzo", email: "non-email", password: "password123" }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("richiede una password non vuota ma senza vincoli di robustezza", () => {
    expect(loginSchema.safeParse({ email: "a@b.it", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.it", password: "" }).success).toBe(false);
  });
});

describe("estimatePasswordStrength", () => {
  it("cresce con lunghezza e varietà", () => {
    const weak = estimatePasswordStrength("abc").score;
    const strong = estimatePasswordStrength("Frase-Lunga-42-sicura!").score;
    expect(weak).toBeLessThan(strong);
    expect(strong).toBe(4);
  });
});
