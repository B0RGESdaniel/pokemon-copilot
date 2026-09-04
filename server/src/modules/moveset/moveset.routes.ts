import type { FastifyInstance } from "fastify";
import {
  buildMovesetHandler,
  compareMovesHandler,
  learnMoveHandler,
  scoreMoveHandler,
} from "./moveset.controller.js";

export async function movesetRoutes(app: FastifyInstance): Promise<void> {
  app.post("/saves/:saveId/moveset/score-move", scoreMoveHandler);
  app.post("/saves/:saveId/moveset/build", buildMovesetHandler);
  app.post("/saves/:saveId/moveset/compare", compareMovesHandler);
  app.post("/pokemon/:id/learn-move", learnMoveHandler);
}
