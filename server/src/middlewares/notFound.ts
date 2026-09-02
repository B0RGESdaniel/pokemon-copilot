import type { FastifyReply, FastifyRequest } from "fastify";

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  reply.status(404).send({ error: `Route not found: ${request.method} ${request.url}` });
}
