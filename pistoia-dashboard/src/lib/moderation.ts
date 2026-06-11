import "server-only";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { findBlockedIn } from "@/lib/word-filter";

/**
 * Shared moderation guards (§14). Used by every community write action so that
 * banned/suspended citizens cannot contribute and blocked words are filtered.
 */

export type ContributeCheck = { ok: true } | { ok: false; error: string };

/** A banned or currently-suspended account cannot create content. */
export async function assertCanContribute(userId: string): Promise<ContributeCheck> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { banned: true, suspendedUntil: true },
  });
  if (!u) return { ok: false, error: "Utente non trovato." };
  if (u.banned) {
    return {
      ok: false,
      error: "Il tuo account è stato sospeso in modo permanente dalla moderazione.",
    };
  }
  if (u.suspendedUntil && u.suspendedUntil.getTime() > Date.now()) {
    return {
      ok: false,
      error: `Il tuo account è temporaneamente sospeso fino al ${formatDate(u.suspendedUntil)}.`,
    };
  }
  return { ok: true };
}

// Small in-memory cache so write actions don't hit the DB for the word list each time.
let wordCache: { at: number; words: string[] } | null = null;

async function blockedWords(): Promise<string[]> {
  const now = Date.now();
  if (wordCache && now - wordCache.at < 60_000) return wordCache.words;
  const rows = await prisma.blockedWord.findMany({ select: { word: true } });
  wordCache = { at: now, words: rows.map((r) => r.word.toLowerCase()) };
  return wordCache.words;
}

/** Clears the cached blocked-word list (call after admin add/remove). */
export function invalidateBlockedWords() {
  wordCache = null;
}

/** Returns the first blocked word contained in `text`, or null if clean. */
export async function findBlockedWord(text: string): Promise<string | null> {
  return findBlockedIn(text, await blockedWords());
}

/** Combined guard for a text contribution: ban/suspension + blocked words. */
export async function checkContribution(
  userId: string,
  text: string,
): Promise<ContributeCheck> {
  const can = await assertCanContribute(userId);
  if (!can.ok) return can;
  const word = await findBlockedWord(text);
  if (word) {
    return {
      ok: false,
      error: "Il messaggio contiene un termine non consentito dalle regole della community.",
    };
  }
  return { ok: true };
}
