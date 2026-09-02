import type { FastifyInstance } from "fastify";
import { createPartyPokemon, listParty, patchPokemon } from "./pokemon.controller.js";

export async function pokemonRoutes(app: FastifyInstance): Promise<void> {
  app.get("/party", listParty);
  app.post("/party", createPartyPokemon);
  app.patch("/pokemon/:id", patchPokemon);
}
