import type { FastifyReply, FastifyRequest } from "fastify";
import { addToPc, addToParty, deletePokemon, getPC, getParty, movePokemon, updatePokemon } from "./pokemon.service.js";
import {
  createPartyPokemonSchema,
  createPcPokemonSchema,
  listBySaveSchema,
  movePokemonSchema,
  updatePokemonSchema,
} from "./pokemon.types.js";

export async function listParty(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { saveId } = listBySaveSchema.parse(request.query);
  const party = await getParty(saveId);
  reply.send(party);
}

export async function listPC(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { saveId } = listBySaveSchema.parse(request.query);
  const pc = await getPC(saveId);
  reply.send(pc);
}

export async function createPartyPokemon(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const input = createPartyPokemonSchema.parse(request.body);
  const pokemon = await addToParty(input);
  reply.status(201).send(pokemon);
}

export async function createPcPokemon(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const input = createPcPokemonSchema.parse(request.body);
  const pokemon = await addToPc(input);
  reply.status(201).send(pokemon);
}

export async function patchPokemon(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = updatePokemonSchema.parse(request.body);
  const pokemon = await updatePokemon(request.params.id, input);
  reply.send(pokemon);
}

export async function movePokemonHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = movePokemonSchema.parse(request.body);
  const pokemon = await movePokemon(request.params.id, input);
  reply.send(pokemon);
}

export async function removePokemon(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  await deletePokemon(request.params.id);
  reply.status(204).send();
}
