-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Atto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chiave" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "anno" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "oggetto" TEXT NOT NULL,
    "ufficio" TEXT NOT NULL,
    "temaCivico" TEXT,
    "dirigente" TEXT,
    "dataAtto" DATETIME,
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
INSERT INTO "new_Atto" ("anno", "chiave", "createdAt", "dataAtto", "dataEsecutivita", "dirigente", "finePubblicazione", "griglia", "id", "idPubblicazione", "inizioPubblicazione", "lettoIl", "numero", "numeroAllegati", "numeroRegistrazione", "oggetto", "temaCivico", "tipo", "ufficio", "updatedAt", "urlFonte") SELECT "anno", "chiave", "createdAt", "dataAtto", "dataEsecutivita", "dirigente", "finePubblicazione", "griglia", "id", "idPubblicazione", "inizioPubblicazione", "lettoIl", "numero", "numeroAllegati", "numeroRegistrazione", "oggetto", "temaCivico", "tipo", "ufficio", "updatedAt", "urlFonte" FROM "Atto";
DROP TABLE "Atto";
ALTER TABLE "new_Atto" RENAME TO "Atto";
CREATE UNIQUE INDEX "Atto_chiave_key" ON "Atto"("chiave");
CREATE INDEX "Atto_temaCivico_idx" ON "Atto"("temaCivico");
CREATE INDEX "Atto_tipo_idx" ON "Atto"("tipo");
CREATE INDEX "Atto_inizioPubblicazione_idx" ON "Atto"("inizioPubblicazione");
CREATE INDEX "Atto_anno_idx" ON "Atto"("anno");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
