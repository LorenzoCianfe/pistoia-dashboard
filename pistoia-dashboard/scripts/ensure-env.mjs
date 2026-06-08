// Creates a local .env on first run (with a fresh random SESSION_SECRET) so the
// app and the Prisma CLI have the values they need. Idempotent.
import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

if (existsSync(".env")) {
  console.log(".env già presente — nessuna modifica.");
} else {
  const secret = randomBytes(48).toString("base64");
  writeFileSync(
    ".env",
    `# Generato automaticamente al primo avvio.\n` +
      `DATABASE_URL="file:./prisma/dev.db"\n` +
      `SESSION_SECRET="${secret}"\n`,
  );
  console.log("Creato .env con un SESSION_SECRET casuale.");
}
