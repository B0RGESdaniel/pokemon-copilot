import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (err instanceof HttpError) {
    reply.status(err.statusCode).send({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    reply.status(400).send({ error: "Validation error", issues: err.issues });
    return;
  }

  request.log.error(err);
  reply.status(500).send({ error: "Internal server error" });
}
