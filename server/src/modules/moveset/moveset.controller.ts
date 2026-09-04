import type { FastifyReply, FastifyRequest } from "fastify";
import { getSaveOrThrow } from "../save/save.service.js";
import { buildMoveset, compareMoves, evaluateNewMove, scoreMove } from "./moveset.service.js";
import { buildMovesetSchema, compareMovesSchema, learnMoveSchema, scoreMoveSchema } from "./moveset.types.js";

export async function scoreMoveHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = scoreMoveSchema.parse(request.body);
  const save = await getSaveOrThrow(request.params.saveId);
  const result = await scoreMove(input.pokeApiId, input.moveName, save.generation);
  reply.send(result);
}

export async function buildMovesetHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = buildMovesetSchema.parse(request.body);
  const moveset = await buildMoveset(request.params.saveId, input.pokeApiId);
  reply.send({ pokeApiId: input.pokeApiId, moveset });
}

export async function learnMoveHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = learnMoveSchema.parse(request.body);
  const result = await evaluateNewMove(request.params.id, input.moveName);
  reply.send(result);
}

export async function compareMovesHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = compareMovesSchema.parse(request.body);
  const save = await getSaveOrThrow(request.params.saveId);
  const comparison = await compareMoves(input.pokeApiId, input.moveNameA, input.moveNameB, save.generation);
  reply.send(comparison);
}
