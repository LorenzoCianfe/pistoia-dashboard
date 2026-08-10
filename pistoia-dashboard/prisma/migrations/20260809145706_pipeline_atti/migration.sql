-- CreateTable
CREATE TABLE "Atto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chiave" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "anno" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "oggetto" TEXT NOT NULL,
    "ufficio" TEXT NOT NULL,
    "temaCivico" TEXT,
    "dirigente" TEXT,
    "dataAtto" DATETIME NOT NULL,
    "dataEsecutivita" DATETIME,
    "numeroAllegati" INTEGER NOT NULL DEFAULT 0,
    "inizioPubblicazione" DATETIME NOT NULL,
    "finePubblicazione" DATETIME,
    "urlFonte" TEXT NOT NULL,
    "idPubblicazione" TEXT NOT NULL,
    "griglia" TEXT NOT NULL,
    "numeroRegistrazione" INTEGER NOT NULL DEFAULT 0,
    "lettoIl" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LetturaAtti" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "griglia" TEXT NOT NULL,
    "iniziataIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finitaIl" DATETIME,
    "esito" TEXT NOT NULL,
    "righeLette" INTEGER NOT NULL DEFAULT 0,
    "attiNuovi" INTEGER NOT NULL DEFAULT 0,
    "attiAggiornati" INTEGER NOT NULL DEFAULT 0,
    "righeScartate" INTEGER NOT NULL DEFAULT 0,
    "messaggio" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Atto_chiave_key" ON "Atto"("chiave");

-- CreateIndex
CREATE INDEX "Atto_temaCivico_idx" ON "Atto"("temaCivico");

-- CreateIndex
CREATE INDEX "Atto_tipo_idx" ON "Atto"("tipo");

-- CreateIndex
CREATE INDEX "Atto_inizioPubblicazione_idx" ON "Atto"("inizioPubblicazione");

-- CreateIndex
CREATE INDEX "Atto_anno_idx" ON "Atto"("anno");

-- CreateIndex
CREATE INDEX "LetturaAtti_iniziataIl_idx" ON "LetturaAtti"("iniziataIl");

-- CreateIndex
CREATE INDEX "LetturaAtti_esito_idx" ON "LetturaAtti"("esito");
