import { post } from "./client";
import type { ValidationResult } from "../types/validation";

export const validatePokemon = (saveId: string, pokeApiId: number, moves: string[]) =>
  post<ValidationResult>(`/saves/${saveId}/validate-pokemon`, { pokeApiId, moves });
