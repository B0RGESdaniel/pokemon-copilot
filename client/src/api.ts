import type {
  BattleStatusResponse,
  EndedBattle,
  EvolutionOption,
  GenerationSpeciesEntry,
  ItemDTO,
  LearnMoveResult,
  LevelUpResult,
  MoveComparisonDTO,
  MoveDTO,
  MoveScoreDTO,
  PokemonDTO,
  Save,
  SpeciesDTO,
  SwapSuggestions,
  TypeChart,
  ValidationResult,
} from "./types";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3333/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    // Content-Type só faz sentido quando existe corpo — mandar em requests
    // sem body (ex: POST /battle pra iniciar) faz o Fastify rejeitar com
    // "Body cannot be empty when content-type is set to 'application/json'".
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
const put = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined });
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del = (path: string) => request<void>(path, { method: "DELETE" });

// Saves
export const listSaves = () => get<Save[]>("/saves");
export const createSave = (input: { name: string; game: string; generation: number }) =>
  post<Save>("/saves", input);

// Party / PC
export const getParty = (saveId: string) => get<PokemonDTO[]>(`/party?saveId=${saveId}`);
export const getPc = (saveId: string) => get<PokemonDTO[]>(`/pc?saveId=${saveId}`);
export type CreatePokemonInput = {
  saveId: string;
  pokeApiId: number;
  nickname?: string;
  level: number;
  heldItem?: string;
  moves: string[];
  slotPosition?: number;
};
export const addToParty = (input: CreatePokemonInput) => post<PokemonDTO>("/party", input);
export const addToPc = (input: Omit<CreatePokemonInput, "slotPosition">) => post<PokemonDTO>("/pc", input);
export type UpdatePokemonInput = Partial<{
  nickname: string | null;
  level: number;
  heldItem: string | null;
  moves: string[];
  pokeApiId: number;
}>;
export const updatePokemon = (id: string, input: UpdatePokemonInput) => patch<PokemonDTO>(`/pokemon/${id}`, input);
export const movePokemon = (id: string, to: "PARTY" | "PC") => post<PokemonDTO>(`/pokemon/${id}/move`, { to });
export const deletePokemon = (id: string) => del(`/pokemon/${id}`);
export const learnMove = (id: string, moveName: string) =>
  post<LearnMoveResult>(`/pokemon/${id}/learn-move`, { moveName });

// PokeAPI-derived data
export const getSpecies = (pokeApiId: number) => get<SpeciesDTO>(`/species/${pokeApiId}`);
export const getEvolutions = (pokeApiId: number) => get<EvolutionOption[]>(`/species/${pokeApiId}/evolutions`);
export const getSpeciesByGeneration = (generation: number) =>
  get<GenerationSpeciesEntry[]>(`/generations/${generation}/species`);
export const getTypeChart = (generation: number) => get<TypeChart>(`/generations/${generation}/type-chart`);
export const getMove = (name: string) => get<MoveDTO>(`/moves/${name}`);
export const searchItems = (search: string) => get<string[]>(`/items?search=${encodeURIComponent(search)}`);
export const getItem = (name: string) => get<ItemDTO>(`/items/${name}`);
export const getLegalMoves = (saveId: string, pokeApiId: number) =>
  get<string[]>(`/saves/${saveId}/species/${pokeApiId}/legal-moves`);

// Validation
export const validatePokemon = (saveId: string, pokeApiId: number, moves: string[]) =>
  post<ValidationResult>(`/saves/${saveId}/validate-pokemon`, { pokeApiId, moves });

// Battle
export const getBattleStatus = (saveId: string) => get<BattleStatusResponse>(`/saves/${saveId}/battle`);
export const startBattle = (saveId: string) => post<BattleStatusResponse>(`/saves/${saveId}/battle`);
export const setBattleOpponent = (saveId: string, pokeApiId: number, level: number) =>
  put<BattleStatusResponse>(`/saves/${saveId}/battle/opponent`, { pokeApiId, level });
export const setBattleActive = (saveId: string, pokemonId: string) =>
  put<BattleStatusResponse>(`/saves/${saveId}/battle/active`, { pokemonId });
export const getBattleSuggestions = (saveId: string) => get<SwapSuggestions>(`/saves/${saveId}/battle/suggestions`);
export const battleLevelUp = (saveId: string, level: number, moveName?: string) =>
  put<LevelUpResult>(`/saves/${saveId}/battle/level-up`, moveName ? { level, moveName } : { level });
export const endBattle = (saveId: string, reason: "opponent_fainted" | "fled") =>
  post<EndedBattle>(`/saves/${saveId}/battle/end`, { reason });

// Moveset engine
export const scoreMove = (saveId: string, pokeApiId: number, moveName: string) =>
  post<MoveScoreDTO>(`/saves/${saveId}/moveset/score-move`, { pokeApiId, moveName });
export const compareMoves = (saveId: string, pokeApiId: number, moveNameA: string, moveNameB: string) =>
  post<MoveComparisonDTO>(`/saves/${saveId}/moveset/compare`, { pokeApiId, moveNameA, moveNameB });
