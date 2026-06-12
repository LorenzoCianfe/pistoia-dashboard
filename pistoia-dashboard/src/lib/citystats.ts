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
