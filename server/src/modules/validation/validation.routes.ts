import type { FastifyInstance } from "fastify";
import { validatePokemonHandler } from "./validation.controller.js";

export async function validationRoutes(app: FastifyInstance): Promise<void> {
  app.post("/saves/:saveId/validate-pokemon", validatePokemonHandler);
}
