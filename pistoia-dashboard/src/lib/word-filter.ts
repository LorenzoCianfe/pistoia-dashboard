// Matcher puro per il filtro delle parole bloccate (§14).
// Separato da lib/moderation.ts (che parla col DB) per essere unit-testabile.

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Returns the first blocked word contained in `text`, or null if clean. */
export function findBlockedIn(text: string, words: string[]): string | null {
  if (words.length === 0) return null;
  const lower = ` ${text.toLowerCase()} `;
  for (const w of words) {
    if (!w) continue;
    // Match as a whole word where possible, fall back to substring for short tokens.
    const re = new RegExp(`(^|[^\\p{L}])${escapeRegExp(w)}([^\\p{L}]|$)`, "iu");
    if (re.test(lower)) return w;
  }
  return null;
}
