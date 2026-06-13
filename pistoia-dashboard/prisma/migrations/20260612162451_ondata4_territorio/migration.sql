-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN "topic" TEXT;

-- AlterTable
ALTER TABLE "Poll" ADD COLUMN "docSummary" TEXT;
ALTER TABLE "Poll" ADD COLUMN "docTitle" TEXT;
ALTER TABLE "Poll" ADD COLUMN "docUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "onboardingDismissedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "tourCompletedAt" DATETIME;

-- CreateTable
CREATE TABLE "QuestionTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aperto',
    "opensAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "QtQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "baseVotes" INTEGER NOT NULL DEFAULT 0,
    "officialAnswer" TEXT,
    "answeredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QtQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuestionTime" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QtQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QtVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QtVote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QtQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QtVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriorityRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aperta',
    "closesAt" DATETIME,
    "resultNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PriorityItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "neighborhoodLabel" TEXT,
    "baseVotes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PriorityItem_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "PriorityRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriorityVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriorityVote_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "PriorityRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriorityVote_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "PriorityItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriorityVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Initiative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "organizerName" TEXT NOT NULL,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "neighborhoodId" TEXT,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "startAt" DATETIME,
    "spots" INTEGER,
    "baseJoins" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'aperta',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Initiative_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InitiativeJoin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InitiativeJoin_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InitiativeJoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdoptedPlace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "adopterName" TEXT NOT NULL,
    "adopterType" TEXT NOT NULL DEFAULT 'cittadini',
    "neighborhoodId" TEXT,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "status" TEXT NOT NULL DEFAULT 'attiva',
    "since" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" TEXT,
    "lastUpdateAt" DATETIME,
    CONSTRAINT "AdoptedPlace_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NeighborhoodPact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "neighborhoodId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "signedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'attivo',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NeighborhoodPact_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PactUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pactId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PactUpdate_pactId_fkey" FOREIGN KEY ("pactId") REFERENCES "NeighborhoodPact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CivicProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposto',
    "category" TEXT NOT NULL,
    "department" TEXT,
    "neighborhoodId" TEXT,
    "baseReports" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CivicProject_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorInitials" TEXT NOT NULL,
    "authorColor" TEXT NOT NULL DEFAULT 'teal',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ricevuta',
    "neighborhoodId" TEXT,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "imageSeed" TEXT,
    "photoData" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "mergedIntoId" TEXT,
    "assignedDepartment" TEXT,
    "baseConfirmations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    "urgency" TEXT,
    "resolutionFeedback" TEXT,
    "resolutionFeedbackAt" DATETIME,
    "civicProjectId" TEXT,
    CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_civicProjectId_fkey" FOREIGN KEY ("civicProjectId") REFERENCES "CivicProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("anonymous", "assignedDepartment", "authorColor", "authorId", "authorInitials", "authorName", "baseConfirmations", "category", "createdAt", "description", "id", "imageSeed", "latitude", "location", "longitude", "mergedIntoId", "neighborhoodId", "photoData", "resolutionFeedback", "resolutionFeedbackAt", "resolvedAt", "status", "title", "updatedAt", "urgency") SELECT "anonymous", "assignedDepartment", "authorColor", "authorId", "authorInitials", "authorName", "baseConfirmations", "category", "createdAt", "description", "id", "imageSeed", "latitude", "location", "longitude", "mergedIntoId", "neighborhoodId", "photoData", "resolutionFeedback", "resolutionFeedbackAt", "resolvedAt", "status", "title", "updatedAt", "urgency" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE INDEX "Report_neighborhoodId_idx" ON "Report"("neighborhoodId");
CREATE INDEX "Report_civicProjectId_idx" ON "Report"("civicProjectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "QuestionTime_status_idx" ON "QuestionTime"("status");

-- CreateIndex
CREATE INDEX "QtQuestion_sessionId_idx" ON "QtQuestion"("sessionId");

-- CreateIndex
CREATE INDEX "QtVote_questionId_idx" ON "QtVote"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QtVote_questionId_userId_key" ON "QtVote"("questionId", "userId");

-- CreateIndex
CREATE INDEX "PriorityRound_status_idx" ON "PriorityRound"("status");

-- CreateIndex
CREATE INDEX "PriorityItem_roundId_idx" ON "PriorityItem"("roundId");

-- CreateIndex
CREATE INDEX "PriorityVote_itemId_idx" ON "PriorityVote"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "PriorityVote_roundId_userId_key" ON "PriorityVote"("roundId", "userId");

-- CreateIndex
CREATE INDEX "Initiative_status_idx" ON "Initiative"("status");

-- CreateIndex
CREATE INDEX "Initiative_neighborhoodId_idx" ON "Initiative"("neighborhoodId");

-- CreateIndex
CREATE INDEX "InitiativeJoin_initiativeId_idx" ON "InitiativeJoin"("initiativeId");

-- CreateIndex
CREATE UNIQUE INDEX "InitiativeJoin_initiativeId_userId_key" ON "InitiativeJoin"("initiativeId", "userId");

-- CreateIndex
CREATE INDEX "AdoptedPlace_status_idx" ON "AdoptedPlace"("status");

-- CreateIndex
CREATE INDEX "AdoptedPlace_neighborhoodId_idx" ON "AdoptedPlace"("neighborhoodId");

-- CreateIndex
CREATE INDEX "NeighborhoodPact_neighborhoodId_idx" ON "NeighborhoodPact"("neighborhoodId");

-- CreateIndex
CREATE INDEX "PactUpdate_pactId_idx" ON "PactUpdate"("pactId");

-- CreateIndex
CREATE INDEX "CivicProject_status_idx" ON "CivicProject"("status");
