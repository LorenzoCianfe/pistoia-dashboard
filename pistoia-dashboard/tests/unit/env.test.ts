import { afterEach, describe, expect, it, vi } from "vitest";

// env.ts valuta process.env al primo import: per testare scenari diversi
// occorre resettare il module registry a ogni caso.
async function loadEnv() {
  vi.resetModules();
  return import("@/lib/env");
}

describe("validazione ambiente (env.ts)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("applica i default fuori produzione", async () => {
    const { env } = await loadEnv();
    expect(env.DATABASE_URL).toBeTruthy();
    expect(env.DEMO_MODE).toBe(true); // default quando NODE_ENV != production
    expect(env.DATA_MODE_BILANCIO).toBe("mock");
  });

  it("accetta i booleani in varie forme", async () => {
    vi.stubEnv("DEMO_MODE", "off");
    const { env } = await loadEnv();
    expect(env.DEMO_MODE).toBe(false);
  });

  it("rifiuta un DEMO_MODE malformato con errore chiaro", async () => {
    vi.stubEnv("DEMO_MODE", "boh");
    await expect(loadEnv()).rejects.toThrow(/DEMO_MODE/);
  });

  it("richiede URL e TOKEN Upstash insieme", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://x.upstash.io");
    await expect(loadEnv()).rejects.toThrow(/UPSTASH/);
  });

  it("rifiuta DATA_MODE sconosciuti", async () => {
    vi.stubEnv("DATA_MODE_OPERE", "vero");
    await expect(loadEnv()).rejects.toThrow(/DATA_MODE_OPERE/);
  });
});
