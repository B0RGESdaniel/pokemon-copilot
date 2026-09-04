import type { FastifyInstance } from "fastify";
import {
  getEvolutionsHandler,
  getItemHandler,
  getLegalMovesHandler,
  getMoveHandler,
  getSpeciesByGenerationHandler,
  getSpeciesHandler,
  getTypeChartByGenerationHandler,
  searchItemsHandler,
} from "./pokeapi.controller.js";

export async function pokeapiRoutes(app: FastifyInstance): Promise<void> {
  app.get("/species/:pokeApiId", getSpeciesHandler);
  app.get("/species/:pokeApiId/evolutions", getEvolutionsHandler);
  app.get("/generations/:generation/species", getSpeciesByGenerationHandler);
  app.get("/generations/:generation/type-chart", getTypeChartByGenerationHandler);
  app.get("/moves/:name", getMoveHandler);

  app.get("/items", searchItemsHandler);
  app.get("/items/:name", getItemHandler);

  app.get("/saves/:saveId/species/:pokeApiId/legal-moves", getLegalMovesHandler);
}
