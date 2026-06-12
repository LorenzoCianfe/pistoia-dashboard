-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN "affectedGroups" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "assessedAt" DATETIME;
ALTER TABLE "Proposal" ADD COLUMN "estimatedCost" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "estimatedImpact" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "estimatedTime" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "feasibility" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "problem" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "civicInterests" TEXT;
