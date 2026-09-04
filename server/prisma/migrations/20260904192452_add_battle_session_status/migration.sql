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
    CONSTRAINT "BattleSession_saveId_fkey" FOREIGN KEY ("saveId") REFERENCES "Save" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BattleSession_activePokemonId_fkey" FOREIGN KEY ("activePokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BattleSession" ("activePokemonId", "createdAt", "id", "opponentLevel", "opponentPokeApiId", "saveId", "updatedAt") SELECT "activePokemonId", "createdAt", "id", "opponentLevel", "opponentPokeApiId", "saveId", "updatedAt" FROM "BattleSession";
DROP TABLE "BattleSession";
ALTER TABLE "new_BattleSession" RENAME TO "BattleSession";
CREATE UNIQUE INDEX "BattleSession_saveId_key" ON "BattleSession"("saveId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
