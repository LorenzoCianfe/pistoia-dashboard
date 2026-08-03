-- CreateTable
CREATE TABLE "CodiceQr" (
    "codice" TEXT NOT NULL PRIMARY KEY,
    "servizioId" TEXT NOT NULL,
    "luogo" TEXT NOT NULL,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodiceQr_servizioId_fkey" FOREIGN KEY ("servizioId") REFERENCES "Servizio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
