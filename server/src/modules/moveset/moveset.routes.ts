import type { FastifyInstance } from "fastify";
import { buildMovesetHandler, compareMovesHandler, scoreMoveHandler } from "./moveset.controller.js";

export async function movesetRoutes(app: FastifyInstance): Promise<void> {
  app.post("/saves/:saveId/moveset/score-move", scoreMoveHandler);
  app.post("/saves/:saveId/moveset/build", buildMovesetHandler);
  app.post("/saves/:saveId/moveset/compare", compareMovesHandler);
}
