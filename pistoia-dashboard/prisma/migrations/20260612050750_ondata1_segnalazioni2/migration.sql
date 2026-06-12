-- AlterTable
ALTER TABLE "Report" ADD COLUMN "resolutionFeedback" TEXT;
ALTER TABLE "Report" ADD COLUMN "resolutionFeedbackAt" DATETIME;
ALTER TABLE "Report" ADD COLUMN "urgency" TEXT;

-- CreateTable
CREATE TABLE "ReportPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "photoData" TEXT,
    "imageSeed" TEXT,
    "caption" TEXT,
    "authorName" TEXT,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportPhoto_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReportPhoto_reportId_idx" ON "ReportPhoto"("reportId");
