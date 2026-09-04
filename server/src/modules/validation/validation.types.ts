import { z } from "zod";

export const validatePokemonSchema = z.object({
  pokeApiId: z.number().int().positive(),
  moves: z.array(z.string().min(1)).max(4).default([]),
});

export type ValidatePokemonInput = z.infer<typeof validatePokemonSchema>;

export type ValidationIssueCode = "SPECIES_NOT_IN_GENERATION" | "MOVE_NOT_LEARNABLE";

export type ValidationIssue = {
  code: ValidationIssueCode;
  message: string;
};

export type ValidationResultDTO = {
  valid: boolean;
  issues: ValidationIssue[];
};
