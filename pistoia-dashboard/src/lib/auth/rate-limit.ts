import "server-only";

// Simple in-memory fixed-window rate limiter.
// NOTE: this resets on server restart and is per-instance only. For a real
// multi-instance deployment, back this with Redis or a database table.

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
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

/** Clear a key after a successful action (e.g. reset login attempts). */
export function rateLimitReset(key: string) {
  buckets.delete(key);
}

// Opportunistic cleanup so the map doesn't grow unbounded.
let lastSweep = 0;
export function sweepRateLimits(now = Date.now()) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}
