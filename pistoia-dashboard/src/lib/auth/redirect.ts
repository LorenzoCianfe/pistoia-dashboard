/**
 * Only allow same-origin relative paths as a post-login redirect target
 * (anti open-redirect). Estratto da actions/auth.ts per renderlo testabile.
 */
export function safeNext(
  value: FormDataEntryValue | null,
  fallback = "/la-mia-citta",
): string {
  const v = typeof value === "string" ? value : "";
  if (v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\")) {
    return v;
  }
  return fallback;
}
