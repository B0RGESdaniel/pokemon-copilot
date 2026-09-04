import { z } from "zod";

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
