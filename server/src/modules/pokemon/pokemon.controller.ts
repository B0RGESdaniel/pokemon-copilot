import type { FastifyReply, FastifyRequest } from "fastify";
import { getParty } from "./pokemon.service.js";

export async function listParty(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const party = await getParty();
  reply.send(party);
}
