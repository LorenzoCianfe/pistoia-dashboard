-- AlterTable
ALTER TABLE "BudgetYear" ADD COLUMN "externalId" TEXT;
ALTER TABLE "BudgetYear" ADD COLUMN "lastSyncedAt" DATETIME;
ALTER TABLE "BudgetYear" ADD COLUMN "sourceName" TEXT;
ALTER TABLE "BudgetYear" ADD COLUMN "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "Opera" ADD COLUMN "externalId" TEXT;
ALTER TABLE "Opera" ADD COLUMN "lastSyncedAt" DATETIME;
ALTER TABLE "Opera" ADD COLUMN "sourceName" TEXT;
ALTER TABLE "Opera" ADD COLUMN "sourceUrl" TEXT;

-- CreateIndex
CREATE INDEX "Opera_externalId_idx" ON "Opera"("externalId");
