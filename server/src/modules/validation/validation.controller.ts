import type { FastifyReply, FastifyRequest } from "fastify";
import { validatePokemonForSave } from "./validation.service.js";
import { validatePokemonSchema } from "./validation.types.js";

export async function validatePokemonHandler(
  request: FastifyRequest<{ Params: { saveId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const input = validatePokemonSchema.parse(request.body);
  const result = await validatePokemonForSave(request.params.saveId, input);
  reply.send(result);
}
