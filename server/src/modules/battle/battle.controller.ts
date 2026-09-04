import type { FastifyReply, FastifyRequest } from "fastify";
import {
  endBattle,
  getBattleStatus,
  getSwapSuggestions,
  levelUp,
  setActivePokemon,
  setOpponent,
  startBattle,
} from "./battle.service.js";
import { endBattleSchema, levelUpSchema, setActivePokemonSchema, setOpponentSchema } from "./battle.types.js";

export async function startBattleHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const state = await startBattle(request.params.saveId);
  reply.status(201).send(state);
}

export async function setOpponentHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = setOpponentSchema.parse(request.body);
  const state = await setOpponent(request.params.saveId, input);
  reply.send(state);
}

export async function setActivePokemonHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = setActivePokemonSchema.parse(request.body);
  const state = await setActivePokemon(request.params.saveId, input);
  reply.send(state);
}

export async function levelUpHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = levelUpSchema.parse(request.body);
  const result = await levelUp(request.params.saveId, input);
  reply.send(result);
}

export async function endBattleHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = endBattleSchema.parse(request.body);
  const result = await endBattle(request.params.saveId, input);
  reply.send(result);
}

export async function getBattleStatusHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const status = await getBattleStatus(request.params.saveId);
  reply.send(status);
}

export async function getSwapSuggestionsHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const suggestions = await getSwapSuggestions(request.params.saveId);
  reply.send(suggestions);
}
