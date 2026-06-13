import "server-only";
import { rateLimit } from "@/lib/auth/rate-limit";

// Budget anti-abuso per le write action della community (Fase 0).
// Chiave per-utente (non per-IP): l'identità è stabile, l'IP è spoofabile.
// I limiti sono generosi per un uso civico normale e stretti per lo spam.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const WRITE_LIMITS = {
  post: { limit: 10, windowMs: HOUR },
  comment: { limit: 30, windowMs: HOUR },
  like: { limit: 200, windowMs: HOUR },
  report: { limit: 6, windowMs: HOUR },
  confirm: { limit: 60, windowMs: HOUR }, // "Anche io"
  proposal: { limit: 4, windowMs: DAY },
  support: { limit: 60, windowMs: HOUR },
  vote: { limit: 60, windowMs: HOUR },
  follow: { limit: 120, windowMs: HOUR },
  feedback: { limit: 60, windowMs: HOUR }, // "risposta utile?"
  flag: { limit: 20, windowMs: HOUR }, // segnala commento
  verification: { limit: 5, windowMs: DAY },
  event: { limit: 5, windowMs: DAY },
  profile: { limit: 20, windowMs: HOUR },
  privacy: { limit: 5, windowMs: HOUR }, // export dati
  question: { limit: 6, windowMs: HOUR }, // question time (O4)
  join: { limit: 30, windowMs: HOUR }, // adesione iniziative (O4)
} as const;

export type WriteKind = keyof typeof WRITE_LIMITS;

export type WriteLimitCheck = { ok: true } | { ok: false; error: string };

/** Da chiamare all'inizio di ogni write action, dopo requireUser(). */
export async function limitWrite(
  userId: string,
  kind: WriteKind,
): Promise<WriteLimitCheck> {
  const cfg = WRITE_LIMITS[kind];
  const rl = await rateLimit(`write:${kind}:${userId}`, cfg.limit, cfg.windowMs);
  if (rl.ok) return { ok: true };
  const mins = Math.max(1, Math.ceil(rl.retryAfterSeconds / 60));
  return {
    ok: false,
    error: `Hai raggiunto il limite di azioni consentite. Riprova tra ${mins} minut${mins === 1 ? "o" : "i"}.`,
  };
}
