/*
  Warnings:

  - You are about to drop the `ServiceReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ServiceReview";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Servizio" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Valutazione" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "servizioId" TEXT NOT NULL,
    "stelle" INTEGER NOT NULL,
    "testo" TEXT,
    "email" TEXT NOT NULL,
    "emailConfermata" BOOLEAN NOT NULL DEFAULT false,
    "confermaToken" TEXT,
    "nomeVisualizzato" TEXT,
    "mostraNomeIntero" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "quartiereId" TEXT,
    "periodo" TEXT NOT NULL,
    "canale" TEXT NOT NULL DEFAULT 'web',
    "qrLuogo" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rimossaIl" DATETIME,
    "rimossaMotivo" TEXT,
    "segnalataIl" DATETIME,
    CONSTRAINT "Valutazione_servizioId_fkey" FOREIGN KEY ("servizioId") REFERENCES "Servizio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Valutazione_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Valutazione_quartiereId_fkey" FOREIGN KEY ("quartiereId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RispostaServizio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "servizioId" TEXT,
    "valutazioneId" TEXT,
    "periodo" TEXT,
    "testo" TEXT NOT NULL,
    "autoreId" TEXT NOT NULL,
    "caricaAlMomento" TEXT,
    "urlFonte" TEXT,
    "dataConsultazione" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RispostaServizio_servizioId_fkey" FOREIGN KEY ("servizioId") REFERENCES "Servizio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RispostaServizio_valutazioneId_fkey" FOREIGN KEY ("valutazioneId") REFERENCES "Valutazione" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RispostaServizio_autoreId_fkey" FOREIGN KEY ("autoreId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Valutazione_confermaToken_key" ON "Valutazione"("confermaToken");

-- CreateIndex
CREATE INDEX "Valutazione_servizioId_periodo_idx" ON "Valutazione"("servizioId", "periodo");

-- CreateIndex
CREATE INDEX "Valutazione_servizioId_rimossaIl_idx" ON "Valutazione"("servizioId", "rimossaIl");

-- CreateIndex
CREATE INDEX "Valutazione_email_servizioId_periodo_idx" ON "Valutazione"("email", "servizioId", "periodo");

-- CreateIndex
CREATE INDEX "RispostaServizio_servizioId_tipo_idx" ON "RispostaServizio"("servizioId", "tipo");

-- CreateIndex
CREATE INDEX "RispostaServizio_valutazioneId_idx" ON "RispostaServizio"("valutazioneId");
