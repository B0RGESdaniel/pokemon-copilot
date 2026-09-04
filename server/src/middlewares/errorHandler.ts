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

  // Erros que o próprio Fastify já classificou como 4xx (ex: parsing de
  // body malformado/vazio) — não faz sentido mascarar isso como 500.
  if (err instanceof Error && "statusCode" in err) {
    const statusCode = (err as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 500) {
      reply.status(statusCode).send({ error: err.message });
      return;
    }
  }

  request.log.error(err);
  reply.status(500).send({ error: "Internal server error" });
}
