-- AlterTable
ALTER TABLE "Atto" ADD COLUMN "curatoIl" DATETIME;
ALTER TABLE "Atto" ADD COLUMN "sommarioRedazionale" TEXT;
ALTER TABLE "Atto" ADD COLUMN "titoloRedazionale" TEXT;

-- CreateIndex
CREATE INDEX "Atto_inizioPubblicazione_curatoIl_idx" ON "Atto"("inizioPubblicazione", "curatoIl");
