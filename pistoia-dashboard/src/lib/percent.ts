/**
 * Convert a list of counts into integer percentages that always sum to exactly
 * 100 (largest-remainder method). Avoids the "33/33/33 = 99%" rounding glitch.
 */
export function toPercents(values: number[]): number[] {
  const total = values.reduce((s, v) => s + v, 0);
  if (total <= 0) return values.map(() => 0);

  const raw = values.map((v) => (v / total) * 100);
  const floored = raw.map(Math.floor);
  let remainder = 100 - floored.reduce((s, v) => s + v, 0);

  const byFraction = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floored];
  for (let k = 0; k < byFraction.length && remainder > 0; k++) {
    result[byFraction[k].i] += 1;
    remainder -= 1;
  }
  return result;
}
