import type { FastifyInstance } from "fastify";
import {
  endBattleHandler,
  getBattleStatusHandler,
  getSwapSuggestionsHandler,
  levelUpHandler,
  setActivePokemonHandler,
  setOpponentHandler,
  startBattleHandler,
} from "./battle.controller.js";

export async function battleRoutes(app: FastifyInstance): Promise<void> {
  app.post("/saves/:saveId/battle", startBattleHandler);
  app.get("/saves/:saveId/battle", getBattleStatusHandler);
  app.put("/saves/:saveId/battle/opponent", setOpponentHandler);
  app.get("/saves/:saveId/battle/suggestions", getSwapSuggestionsHandler);
  app.put("/saves/:saveId/battle/active", setActivePokemonHandler);
  app.put("/saves/:saveId/battle/level-up", levelUpHandler);
  app.post("/saves/:saveId/battle/end", endBattleHandler);
}
