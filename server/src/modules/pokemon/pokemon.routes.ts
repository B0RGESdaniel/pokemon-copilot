import type { FastifyInstance } from "fastify";
import {
  createPartyPokemon,
  createPcPokemon,
  listPC,
  listParty,
  movePokemonHandler,
  patchPokemon,
  removePokemon,
} from "./pokemon.controller.js";

export async function pokemonRoutes(app: FastifyInstance): Promise<void> {
  app.get("/party", listParty);
  app.get("/pc", listPC);
  app.post("/party", createPartyPokemon);
  app.post("/pc", createPcPokemon);
  app.patch("/pokemon/:id", patchPokemon);
  app.delete("/pokemon/:id", removePokemon);
  app.post("/pokemon/:id/move", movePokemonHandler);
}
