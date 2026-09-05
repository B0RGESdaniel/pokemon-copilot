import { get } from "./client";
import type { EvolutionOption, GenerationSpeciesEntry, ItemDTO, MoveDTO, SpeciesDTO, TypeChart } from "../types/species";

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
