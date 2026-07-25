// Helper puri per gli indicatori "Stato della città" (O3).
// Separati dal data layer (server-only + Prisma) per essere unit-testabili.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Conta le date in bucket settimanali, dal più vecchio al più recente. */
export function weeklyBuckets(dates: Date[], now: Date, weeks: number): number[] {
  const out = new Array<number>(weeks).fill(0);
  for (const d of dates) {
    const age = now.getTime() - d.getTime();
    if (age < 0) continue;
    const idx = Math.floor(age / WEEK_MS);
    if (idx < weeks) out[weeks - 1 - idx] += 1;
  }
  return out;
}

/**
 * Etichette dei bucket di `weeklyBuckets`, nello stesso ordine.
 * Ogni etichetta è il giorno di INIZIO della settimana, es. "12 mag".
 */
export function weeklyLabels(now: Date, weeks: number): string[] {
  const fmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });
  return Array.from({ length: weeks }, (_, i) =>
    fmt.format(new Date(now.getTime() - (weeks - 1 - i) * WEEK_MS)),
  );
}
