-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BattleSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saveId" TEXT NOT NULL,
    "activePokemonId" TEXT NOT NULL,
    "opponentPokeApiId" INTEGER,
    "opponentLevel" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "endReason" TEXT,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BattleSession_saveId_fkey" FOREIGN KEY ("saveId") REFERENCES "Save" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattleSession_activePokemonId_fkey" FOREIGN KEY ("activePokemonId") REFERENCES "Pokemon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BattleSession" ("activePokemonId", "createdAt", "endReason", "endedAt", "id", "opponentLevel", "opponentPokeApiId", "saveId", "status", "updatedAt") SELECT "activePokemonId", "createdAt", "endReason", "endedAt", "id", "opponentLevel", "opponentPokeApiId", "saveId", "status", "updatedAt" FROM "BattleSession";
DROP TABLE "BattleSession";
ALTER TABLE "new_BattleSession" RENAME TO "BattleSession";
CREATE UNIQUE INDEX "BattleSession_saveId_key" ON "BattleSession"("saveId");
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
    CONSTRAINT "Pokemon_saveId_fkey" FOREIGN KEY ("saveId") REFERENCES "Save" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pokemon" ("createdAt", "heldItem", "id", "level", "location", "moves", "nickname", "pokeApiId", "saveId", "slotPosition", "updatedAt") SELECT "createdAt", "heldItem", "id", "level", "location", "moves", "nickname", "pokeApiId", "saveId", "slotPosition", "updatedAt" FROM "Pokemon";
DROP TABLE "Pokemon";
ALTER TABLE "new_Pokemon" RENAME TO "Pokemon";
CREATE UNIQUE INDEX "Pokemon_saveId_location_slotPosition_key" ON "Pokemon"("saveId", "location", "slotPosition");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
