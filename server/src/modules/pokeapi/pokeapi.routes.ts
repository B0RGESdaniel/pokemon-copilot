import type { FastifyInstance } from "fastify";
import { getItemHandler, getMoveHandler, getSpeciesHandler, searchItemsHandler } from "./pokeapi.controller.js";

export async function pokeapiRoutes(app: FastifyInstance): Promise<void> {
  app.get("/species/:pokeApiId", getSpeciesHandler);
  app.get("/moves/:name", getMoveHandler);

  app.get("/items", searchItemsHandler);
  app.get("/items/:name", getItemHandler);
}
