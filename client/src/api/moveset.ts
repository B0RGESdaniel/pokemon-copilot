import { post } from "./client";
import type { MoveComparisonDTO, MoveScoreDTO } from "../types/moveset";

export const scoreMove = (saveId: string, pokeApiId: number, moveName: string) =>
  post<MoveScoreDTO>(`/saves/${saveId}/moveset/score-move`, { pokeApiId, moveName });
export const compareMoves = (saveId: string, pokeApiId: number, moveNameA: string, moveNameB: string) =>
  post<MoveComparisonDTO>(`/saves/${saveId}/moveset/compare`, { pokeApiId, moveNameA, moveNameB });
