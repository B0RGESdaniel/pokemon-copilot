/*
  Warnings:

  - Added the required column `saveId` to the `Pokemon` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Save" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pokemon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saveId" TEXT NOT NULL,
    "pokeApiId" INTEGER NOT NULL,
    "nickname" TEXT,
    "level" INTEGER NOT NULL,
    "heldItem" TEXT,
    "location" TEXT NOT NULL,
    "slotPosition" INTEGER,
    "moves" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pokemon_saveId_fkey" FOREIGN KEY ("saveId") REFERENCES "Save" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pokemon" ("createdAt", "heldItem", "id", "level", "location", "moves", "nickname", "pokeApiId", "slotPosition", "updatedAt") SELECT "createdAt", "heldItem", "id", "level", "location", "moves", "nickname", "pokeApiId", "slotPosition", "updatedAt" FROM "Pokemon";
DROP TABLE "Pokemon";
ALTER TABLE "new_Pokemon" RENAME TO "Pokemon";
CREATE UNIQUE INDEX "Pokemon_saveId_location_slotPosition_key" ON "Pokemon"("saveId", "location", "slotPosition");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
