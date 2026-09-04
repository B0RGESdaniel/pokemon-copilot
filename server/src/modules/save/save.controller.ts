import type { FastifyReply, FastifyRequest } from "fastify";
import { createSave, getSaveOrThrow, listSaves } from "./save.service.js";
import { createSaveSchema } from "./save.types.js";

export async function listSavesHandler(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const saves = await listSaves();
  reply.send(saves);
}

export async function getSaveHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const save = await getSaveOrThrow(request.params.id);
  reply.send(save);
}

export async function createSaveHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const input = createSaveSchema.parse(request.body);
  const save = await createSave(input);
  reply.status(201).send(save);
}
