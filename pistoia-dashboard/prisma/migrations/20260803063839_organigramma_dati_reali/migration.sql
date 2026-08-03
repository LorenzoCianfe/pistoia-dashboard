/*
  Warnings:

  - You are about to drop the column `area` on the `Assessore` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Assessore` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Assessore` table. All the data in the column will be lost.
  - You are about to drop the column `initials` on the `Assessore` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Assessore` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Assessore` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Assessore` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Assessore` table. All the data in the column will be lost.
  - You are about to drop the column `votesElected` on the `Assessore` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assessore" (
    "id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Assessore" ("id") SELECT "id" FROM "Assessore";
DROP TABLE "Assessore";
ALTER TABLE "new_Assessore" RENAME TO "Assessore";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
