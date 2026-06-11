import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 uses the Wasm query compiler + a driver adapter (no Rust engine).
// For local development we point better-sqlite3 at the file database.
//
// NOTA Postgres (Fase 1): il client generato è dialect-specific. Il passaggio
// a PostgreSQL/Neon NON è uno switch runtime ma una migrazione una-tantum:
//   1. datasource provider = "postgresql" in schema.prisma
//   2. nuova baseline migrations (prisma migrate diff) + prisma generate
//   3. qui: adapter @prisma/adapter-pg al posto di better-sqlite3
// Procedura completa in DOCUMENTATION.md §"Migrazione a Postgres".
const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
  throw new Error(
    "DATABASE_URL punta a Postgres ma il client Prisma è generato per SQLite. " +
      "Segui la procedura 'Migrazione a Postgres' in DOCUMENTATION.md.",
  );
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

// Reuse a single client across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
