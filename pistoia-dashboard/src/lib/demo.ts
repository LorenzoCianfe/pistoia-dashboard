import "server-only";
import { env } from "@/lib/env";

// "La trasparenza reale non abbellisce": i baseline finti (baseVotes,
// baseLikes, baseSupports, baseConfirmations, recensioni servizi) rendono la
// demo credibile ma NON devono mai contare in produzione.

export const DEMO_MODE = env.DEMO_MODE;

/** Un baseline mock additivo: vale 0 quando DEMO_MODE è spento. */
export function demoBaseline(n: number): number {
  return DEMO_MODE ? n : 0;
}
