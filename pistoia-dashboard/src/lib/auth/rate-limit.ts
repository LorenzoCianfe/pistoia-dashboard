import "server-only";
import { env } from "@/lib/env";

// Rate limiter a finestra fissa con store intercambiabile (Fase 1).
// - MemoryStore: default in sviluppo; per-istanza, si azzera al riavvio.
// - UpstashStore: Redis via REST (nessuna dipendenza npm), condiviso tra
//   istanze serverless; attivo quando UPSTASH_REDIS_REST_URL/TOKEN sono in .env.

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

interface RateLimitStore {
  /** Registra un tentativo e restituisce lo stato della finestra. */
  hit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
  /** Azzera una chiave (es. login riuscito). */
  reset(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Store in memoria (per-istanza)
// ---------------------------------------------------------------------------

type Entry = { count: number; resetAt: number };

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, Entry>();
  private lastSweep = 0;

  async hit(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    this.sweep(now);

    const entry = this.buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    if (entry.count >= limit) {
      return {
        ok: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    entry.count += 1;
    return { ok: true, remaining: limit - entry.count, retryAfterSeconds: 0 };
  }

  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }

  /** Pulizia opportunistica così la mappa non cresce senza limite. */
  private sweep(now: number) {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, entry] of this.buckets) {
      if (entry.resetAt <= now) this.buckets.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Store Upstash Redis (REST, condiviso tra istanze)
// ---------------------------------------------------------------------------

class UpstashStore implements RateLimitStore {
  constructor(
    private url: string,
    private token: string,
    private fallback: RateLimitStore,
  ) {}

  async hit(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    try {
      // Pipeline atomica "abbastanza": INCR crea/incrementa il contatore,
      // PEXPIRE ... NX imposta la scadenza solo al primo hit della finestra,
      // PTTL ci dice quanto manca alla fine della finestra.
      const k = `rl:${key}`;
      const results = await this.pipeline([
        ["INCR", k],
        ["PEXPIRE", k, String(windowMs), "NX"],
        ["PTTL", k],
      ]);
      const count = Number(results[0]);
      const ttlMs = Number(results[2]);
      if (!Number.isFinite(count) || count < 1) {
        throw new Error(`risposta Upstash inattesa: ${JSON.stringify(results)}`);
      }
      if (count > limit) {
        return {
          ok: false,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil(Math.max(ttlMs, 0) / 1000)),
        };
      }
      return { ok: true, remaining: limit - count, retryAfterSeconds: 0 };
    } catch (err) {
      // Redis irraggiungibile: degrada allo store in memoria invece di negare
      // il servizio (il limite per-istanza resta come difesa minima).
      console.error("[rate-limit] Upstash non raggiungibile, fallback in memoria:", err);
      return this.fallback.hit(key, limit, windowMs);
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.pipeline([["DEL", `rl:${key}`]]);
    } catch (err) {
      console.error("[rate-limit] reset Upstash fallito:", err);
    }
    await this.fallback.reset(key);
  }

  private async pipeline(commands: (string | number)[][]): Promise<unknown[]> {
    const res = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      // Mai bloccare un'azione utente per più di qualche secondo.
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
    const data = (await res.json()) as { result?: unknown; error?: string }[];
    const failed = data.find((d) => d.error);
    if (failed) throw new Error(`Upstash: ${failed.error}`);
    return data.map((d) => d.result);
  }
}

// ---------------------------------------------------------------------------

const memoryStore = new MemoryStore();
const store: RateLimitStore =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new UpstashStore(
        env.UPSTASH_REDIS_REST_URL,
        env.UPSTASH_REDIS_REST_TOKEN,
        memoryStore,
      )
    : memoryStore;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  return store.hit(key, limit, windowMs);
}

/** Clear a key after a successful action (e.g. reset login attempts). */
export function rateLimitReset(key: string): Promise<void> {
  return store.reset(key);
}

/** Solo per i test: uno store in memoria isolato. */
export function createMemoryRateLimitStore(): {
  hit: (key: string, limit: number, windowMs: number) => Promise<RateLimitResult>;
  reset: (key: string) => Promise<void>;
} {
  return new MemoryStore();
}
