-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PostComment" ("authorName", "body", "createdAt", "id", "postId") SELECT "authorName", "body", "createdAt", "id", "postId" FROM "PostComment";
DROP TABLE "PostComment";
ALTER TABLE "new_PostComment" RENAME TO "PostComment";
CREATE INDEX "PostComment_postId_idx" ON "PostComment"("postId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
