import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryRateLimitStore } from "@/lib/auth/rate-limit";

describe("rate limiter (finestra fissa, store in memoria)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("consente fino al limite e poi blocca", async () => {
    const store = createMemoryRateLimitStore();
    for (let i = 0; i < 5; i++) {
      const r = await store.hit("k", 5, 60_000);
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(5 - (i + 1));
    }
    const blocked = await store.hit("k", 5, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("riapre la finestra dopo la scadenza", async () => {
    const store = createMemoryRateLimitStore();
    for (let i = 0; i < 3; i++) await store.hit("k", 3, 60_000);
    expect((await store.hit("k", 3, 60_000)).ok).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect((await store.hit("k", 3, 60_000)).ok).toBe(true);
  });

  it("le chiavi sono indipendenti", async () => {
    const store = createMemoryRateLimitStore();
    await store.hit("a", 1, 60_000);
    expect((await store.hit("a", 1, 60_000)).ok).toBe(false);
    expect((await store.hit("b", 1, 60_000)).ok).toBe(true);
  });

  it("reset azzera la chiave", async () => {
    const store = createMemoryRateLimitStore();
    await store.hit("k", 1, 60_000);
    expect((await store.hit("k", 1, 60_000)).ok).toBe(false);
    await store.reset("k");
    expect((await store.hit("k", 1, 60_000)).ok).toBe(true);
  });
});
