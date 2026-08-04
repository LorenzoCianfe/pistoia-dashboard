-- CreateTable
CREATE TABLE "Sollecitazione" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "canale" TEXT NOT NULL,
    "mostrataIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "esito" TEXT,
    "esitoIl" DATETIME,
    CONSTRAINT "Sollecitazione_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromemoriaRinnovo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "chiestoIl" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoInvio" TEXT
);

-- CreateIndex
CREATE INDEX "Sollecitazione_userId_mostrataIl_idx" ON "Sollecitazione"("userId", "mostrataIl");

-- CreateIndex
CREATE UNIQUE INDEX "PromemoriaRinnovo_email_key" ON "PromemoriaRinnovo"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PromemoriaRinnovo_token_key" ON "PromemoriaRinnovo"("token");
