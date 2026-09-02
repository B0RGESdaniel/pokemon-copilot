import type { FastifyReply, FastifyRequest } from "fastify";
import { addToParty, deletePokemon, getPC, getParty, movePokemon, updatePokemon } from "./pokemon.service.js";
import { createPartyPokemonSchema, movePokemonSchema, updatePokemonSchema } from "./pokemon.types.js";

export async function listParty(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const party = await getParty();
  reply.send(party);
}

export async function listPC(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const pc = await getPC();
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
