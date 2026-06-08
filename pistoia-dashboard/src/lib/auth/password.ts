import "server-only";
import { hash, verify } from "@node-rs/argon2";

// Argon2id with OWASP-recommended parameters (m=19 MiB, t=2, p=1).
// Argon2id is the default algorithm in @node-rs/argon2.
const ARGON_OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON_OPTS);
}

export function verifyPassword(
  hashed: string,
  password: string,
): Promise<boolean> {
  return verify(hashed, password, ARGON_OPTS);
}

// A real, lazily-computed throwaway hash. Verifying against it when an email
// does not exist keeps login timing roughly constant, mitigating
// user-enumeration via response time.
let dummyHashPromise: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword("argon2id-timing-equalization-placeholder");
  }
  return dummyHashPromise;
}
