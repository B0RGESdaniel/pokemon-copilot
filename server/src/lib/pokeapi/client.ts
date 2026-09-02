import { PokeApiNotFoundError, PokeApiUnavailableError } from "./errors.js";

const BASE_URL = "https://pokeapi.co/api/v2";
const USER_AGENT = "pokemon-copilot/0.1 (personal project; +https://github.com/B0RGESdaniel/pokemon-copilot)";
const MAX_ATTEMPTS = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// PokeAPI serve dados essencialmente estáticos, então um retry curto com
// backoff resolve a maioria das falhas transitórias (rede, 5xx) sem
// precisar de uma lib de circuit breaker pra um app pessoal.
export async function fetchFromPokeApi<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });

      if (res.status === 404) {
        throw new PokeApiNotFoundError(path);
      }

      if (!res.ok) {
        throw new Error(`PokeAPI responded ${res.status} for ${path}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof PokeApiNotFoundError) {
        throw err;
      }

      lastError = err;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(250 * attempt);
      }
    }
  }

  throw new PokeApiUnavailableError(path, lastError);
}
