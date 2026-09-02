import type { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../../middlewares/errorHandler.js";
import { getItem, getMove, getSpecies, searchItemNames } from "./pokeapi.service.js";

export async function getSpeciesHandler(
  request: FastifyRequest<{ Params: { pokeApiId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const pokeApiId = Number(request.params.pokeApiId);
  if (!Number.isInteger(pokeApiId) || pokeApiId <= 0) {
    throw new HttpError(400, "pokeApiId must be a positive integer");
  }

  const species = await getSpecies(pokeApiId);
  reply.send(species);
}

export async function getMoveHandler(
  request: FastifyRequest<{ Params: { name: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const move = await getMove(request.params.name);
  reply.send(move);
}

export async function getItemHandler(
  request: FastifyRequest<{ Params: { name: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const item = await getItem(request.params.name);
  reply.send(item);
}

export async function searchItemsHandler(
  request: FastifyRequest<{ Querystring: { search?: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const query = request.query.search ?? "";
  const names = query.length > 0 ? await searchItemNames(query) : [];
  reply.send(names);
}
