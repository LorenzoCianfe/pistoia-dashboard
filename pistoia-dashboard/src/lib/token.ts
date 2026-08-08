import { z } from "zod";

/**
 * I token opachi delle mail: `crypto.randomBytes(18|24).toString("base64url")`,
 * cioè 24 o 32 caratteri dell'alfabeto base64url.
 *
 * ⚠️ **Esiste perché una Server Action è un endpoint HTTP pubblico**, e la
 * firma TypeScript non vale al confine di rete: chi conosce l'id dell'azione
 * può invocarla con qualunque argomento, `undefined` compreso. Gli argomenti
 * *legati* con `.bind()` Next li cifra, ma l'azione resta invocabile da sola.
 *
 * E `undefined` dentro un `where` di Prisma non significa «nessuna riga»:
 * significa **«nessun filtro»**. Misurato il 2026-08-08 sul database di
 * sviluppo, in una transazione ribaltata:
 *
 *     deleteMany({ where: { token: "non-esiste" } })  → cancellate 0
 *     deleteMany({ where: { token: undefined     } })  → cancellate 3 su 3
 *
 * La seconda riga non dà errore e non lascia traccia. `findUnique` invece
 * rifiuta (`PrismaClientValidationError`), quindi lì il difetto è un 500 e non
 * una cancellazione — ma la difesa è la stessa, e si mette **prima** della
 * query, non dentro.
 */
const FORMA_TOKEN = /^[A-Za-z0-9_-]{16,64}$/;

export const schemaToken = z.string().regex(FORMA_TOKEN);

/** Vero solo se `v` ha la forma di un token generato da noi. */
export function tokenValido(v: unknown): v is string {
  return typeof v === "string" && FORMA_TOKEN.test(v);
}

/**
 * Vero se `v` è un identificativo di riga plausibile (cuid del seed o di
 * Prisma). Stessa ragione di `tokenValido`: un id nudo passato a Prisma da
 * un'azione pubblica va guardato prima, non dopo.
 */
export function idValido(v: unknown): v is string {
  return typeof v === "string" && /^[a-z0-9]{20,40}$/i.test(v);
}
