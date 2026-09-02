import type { FastifyInstance } from "fastify";
import { listParty } from "./pokemon.controller.js";

export async function pokemonRoutes(app: FastifyInstance): Promise<void> {
  app.get("/party", listParty);
}
