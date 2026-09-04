-- CreateTable
CREATE TABLE "BattleSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saveId" TEXT NOT NULL,
    "activePokemonId" TEXT NOT NULL,
    "opponentPokeApiId" INTEGER,
    "opponentLevel" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BattleSession_saveId_fkey" FOREIGN KEY ("saveId") REFERENCES "Save" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BattleSession_activePokemonId_fkey" FOREIGN KEY ("activePokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BattleSession_saveId_key" ON "BattleSession"("saveId");
