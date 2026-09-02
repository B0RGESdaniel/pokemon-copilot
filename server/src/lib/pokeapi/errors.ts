import { HttpError } from "../../middlewares/errorHandler.js";

export class PokeApiNotFoundError extends HttpError {
  constructor(resource: string) {
    super(404, `PokeAPI resource not found: ${resource}`);
  }
}

export class PokeApiUnavailableError extends HttpError {
  constructor(resource: string, cause: unknown) {
    super(502, `PokeAPI is unavailable (fetching ${resource}): ${String(cause)}`);
  }
}
