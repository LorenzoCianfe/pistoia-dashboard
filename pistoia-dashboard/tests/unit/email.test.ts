import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { scriviSuFile, sendEmail } from "@/lib/email";

// Cartella temporanea, non `.email/` del progetto: un test che scrive nella
// cassetta vera inquinerebbe ciò che gli E2E e la demo leggono (AGENTS.md §3,
// Fase A: «un test che scrive senza disfare esaurisce il proprio scenario»).
const dir = mkdtempSync(path.join(os.tmpdir(), "email-test-"));

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("il trasporto su file (sviluppo e test)", () => {
  it("scrive un file JSON con destinatario, oggetto, testo e data", async () => {
    const file = await scriviSuFile(
      { to: "anna@example.com", subject: "Prova", text: "Ciao.\nRiga due." },
      dir,
    );
    const contenuto = JSON.parse(readFileSync(file, "utf8"));
    expect(contenuto.to).toBe("anna@example.com");
    expect(contenuto.subject).toBe("Prova");
    expect(contenuto.text).toContain("Riga due");
    expect(new Date(contenuto.sentAt).getTime()).not.toBeNaN();
  });

  it("due invii nello stesso istante producono due file distinti", async () => {
    const prima = readdirSync(dir).length;
    await Promise.all([
      scriviSuFile({ to: "a@example.com", subject: "1", text: "x" }, dir),
      scriviSuFile({ to: "b@example.com", subject: "2", text: "y" }, dir),
    ]);
    expect(readdirSync(dir).length).toBe(prima + 2);
  });
});

describe("la guardia di produzione", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("rifiuta l'invio finché il trasporto vero non è configurato", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(
      sendEmail({ to: "a@example.com", subject: "x", text: "y" }),
    ).rejects.toThrow(/non configurato/);
  });
});
