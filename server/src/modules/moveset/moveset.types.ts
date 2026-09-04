import { z } from "zod";
import type { PokemonDTO } from "../pokemon/pokemon.types.js";

export const scoreMoveSchema = z.object({
  pokeApiId: z.number().int().positive(),
  moveName: z.string().min(1),
});

export type ScoreMoveInput = z.infer<typeof scoreMoveSchema>;

export const buildMovesetSchema = z.object({
  pokeApiId: z.number().int().positive(),
});

export type BuildMovesetInput = z.infer<typeof buildMovesetSchema>;

export const compareMovesSchema = z.object({
  pokeApiId: z.number().int().positive(),
  moveNameA: z.string().min(1),
  moveNameB: z.string().min(1),
});

export type CompareMovesInput = z.infer<typeof compareMovesSchema>;

export const learnMoveSchema = z.object({
  moveName: z.string().min(1),
});

export type LearnMoveInput = z.infer<typeof learnMoveSchema>;

export type DamageClass = "physical" | "special" | "status";

export type MoveScoreDTO = {
  move: string;
  type: string;
  damageClass: DamageClass;
  power: number;
  stab: boolean;
  statWeight: number;
  score: number;
  reasons: string[];
};

export type MovesetDTO = {
  pokeApiId: number;
  moveset: MoveScoreDTO[];
};

export type MoveComparisonDTO = {
  moveA: MoveScoreDTO;
  moveB: MoveScoreDTO;
  winner: string | null;
};

// "learned_directly": menos de 4 moves, sem decisão a fazer — já grava no
// Pokémon. "suggested_replacement": já tem 4, só sugere (moveA nas
// comparisons é sempre o move novo) — quem decide aplicar é o usuário via
// PATCH /pokemon/:id existente.
export type LearnMoveResultDTO =
  | {
      outcome: "learned_directly";
      pokemon: PokemonDTO;
      learnedMove: MoveScoreDTO;
    }
  | {
      outcome: "suggested_replacement";
      newMove: MoveScoreDTO;
      comparisons: MoveComparisonDTO[];
      suggestedReplacement: string;
    };
