import { del, get, patch, post } from "./client";
import type { LearnMoveResult, PokemonDTO } from "../types/pokemon";

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
