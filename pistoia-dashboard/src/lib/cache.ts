import "server-only";
import { unstable_cache } from "next/cache";

// Cache a tag per le letture CONDIVISE (Fase 1).
// Le pagine sono dinamiche (sessione nei cookie), ma le query identiche per
// tutti gli utenti — bilancio, lista opere, eventi pubblicati, quartieri —
// non devono colpire il DB a ogni richiesta. Le write action invalidano il
// tag corrispondente con revalidateTag(tag, "max").
//
// REGOLA: mai passare di qui dati per-utente (follow, voti, "mio") — la cache
// è condivisa tra TUTTI gli utenti.

export const TAGS = {
  budget: "budget",
  opere: "opere",
  eventi: "eventi",
  quartieri: "quartieri",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

// unstable_cache serializza in JSON: alla lettura dalla cache i Date diventano
// stringhe ISO. Questo reviver riconverte in profondità, così i chiamanti
// continuano a ricevere veri Date (formatDate, .getTime(), ecc.).
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function reviveDates<T>(value: T): T {
  if (typeof value === "string") {
    return (ISO_DATE.test(value) ? new Date(value) : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map(reviveDates) as T;
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = reviveDates(v);
    return out as T;
  }
  return value;
}

/**
 * Wrappa una lettura condivisa in unstable_cache con tag + TTL.
 * `keyPrefix` distingue la entry; gli argomenti della funzione fanno parte
 * della chiave automaticamente.
 */
export function cachedShared<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyPrefix: string,
  tags: CacheTag[],
  revalidateSeconds = 300,
): (...args: A) => Promise<R> {
  const cached = unstable_cache(fn, [keyPrefix], {
    tags: [...tags],
    revalidate: revalidateSeconds,
  });
  return async (...args: A) => reviveDates(await cached(...args));
}
