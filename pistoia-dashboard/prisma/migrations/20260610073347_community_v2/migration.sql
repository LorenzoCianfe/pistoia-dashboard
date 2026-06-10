-- CreateTable
CREATE TABLE "OperaPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operaId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperaPhoto_operaId_fkey" FOREIGN KEY ("operaId") REFERENCES "Opera" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperaFaq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operaId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OperaFaq_operaId_fkey" FOREIGN KEY ("operaId") REFERENCES "Opera" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperaComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operaId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorInitials" TEXT NOT NULL,
    "authorColor" TEXT NOT NULL DEFAULT 'teal',
    "body" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperaComment_operaId_fkey" FOREIGN KEY ("operaId") REFERENCES "Opera" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OperaComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "neighborhoodId" TEXT,
    "organizerId" TEXT,
    "organizerName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "imageSeed" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnswerFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnswerFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommentReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "PostComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockedWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Opera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "investment" INTEGER NOT NULL,
    "fundingSource" TEXT,
    "rup" TEXT,
    "location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "neighborhoodId" TEXT,
    "startedAt" DATETIME,
    "expectedEnd" DATETIME,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Opera_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Opera" ("category", "createdAt", "description", "expectedEnd", "featured", "id", "investment", "location", "name", "progress", "startedAt", "status") SELECT "category", "createdAt", "description", "expectedEnd", "featured", "id", "investment", "location", "name", "progress", "startedAt", "status" FROM "Opera";
DROP TABLE "Opera";
ALTER TABLE "new_Opera" RENAME TO "Opera";
CREATE INDEX "Opera_neighborhoodId_idx" ON "Opera"("neighborhoodId");
CREATE TABLE "new_PostComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PostComment" ("authorId", "authorName", "body", "createdAt", "id", "postId") SELECT "authorId", "authorName", "body", "createdAt", "id", "postId" FROM "PostComment";
DROP TABLE "PostComment";
ALTER TABLE "new_PostComment" RENAME TO "PostComment";
CREATE INDEX "PostComment_postId_idx" ON "PostComment"("postId");
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
    CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("assignedDepartment", "authorColor", "authorId", "authorInitials", "authorName", "baseConfirmations", "category", "createdAt", "description", "id", "imageSeed", "latitude", "location", "longitude", "neighborhoodId", "resolvedAt", "status", "title", "updatedAt") SELECT "assignedDepartment", "authorColor", "authorId", "authorInitials", "authorName", "baseConfirmations", "category", "createdAt", "description", "id", "imageSeed", "latitude", "location", "longitude", "neighborhoodId", "resolvedAt", "status", "title", "updatedAt" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE INDEX "Report_neighborhoodId_idx" ON "Report"("neighborhoodId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publicName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CITIZEN',
    "accountType" TEXT NOT NULL DEFAULT 'CITIZEN',
    "verifiedType" TEXT,
    "avatarColor" TEXT NOT NULL DEFAULT 'teal',
    "bio" TEXT,
    "quartiere" TEXT,
    "neighborhoodId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "geoConsent" BOOLEAN NOT NULL DEFAULT false,
    "suspendedUntil" DATETIME,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accountType", "avatarColor", "bio", "createdAt", "email", "emailVerified", "id", "name", "neighborhoodId", "passwordHash", "publicName", "quartiere", "role", "updatedAt", "verifiedType") SELECT "accountType", "avatarColor", "bio", "createdAt", "email", "emailVerified", "id", "name", "neighborhoodId", "passwordHash", "publicName", "quartiere", "role", "updatedAt", "verifiedType" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_neighborhoodId_idx" ON "User"("neighborhoodId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "OperaPhoto_operaId_idx" ON "OperaPhoto"("operaId");

-- CreateIndex
CREATE INDEX "OperaFaq_operaId_idx" ON "OperaFaq"("operaId");

-- CreateIndex
CREATE INDEX "OperaComment_operaId_idx" ON "OperaComment"("operaId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startAt_idx" ON "Event"("startAt");

-- CreateIndex
CREATE INDEX "Event_neighborhoodId_idx" ON "Event"("neighborhoodId");

-- CreateIndex
CREATE INDEX "AnswerFeedback_targetType_targetId_idx" ON "AnswerFeedback"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerFeedback_targetType_targetId_userId_key" ON "AnswerFeedback"("targetType", "targetId", "userId");

-- CreateIndex
CREATE INDEX "CommentReport_status_idx" ON "CommentReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReport_commentId_reporterId_key" ON "CommentReport"("commentId", "reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedWord_word_key" ON "BlockedWord"("word");
