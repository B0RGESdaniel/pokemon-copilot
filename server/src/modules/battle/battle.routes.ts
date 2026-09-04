import type { FastifyInstance } from "fastify";
import {
  getSwapSuggestionsHandler,
  levelUpHandler,
  setActivePokemonHandler,
  setOpponentHandler,
  startBattleHandler,
} from "./battle.controller.js";

export async function battleRoutes(app: FastifyInstance): Promise<void> {
  app.post("/saves/:saveId/battle", startBattleHandler);
  app.put("/saves/:saveId/battle/opponent", setOpponentHandler);
  app.get("/saves/:saveId/battle/suggestions", getSwapSuggestionsHandler);
  app.put("/saves/:saveId/battle/active", setActivePokemonHandler);
  app.put("/saves/:saveId/battle/level-up", levelUpHandler);
}
