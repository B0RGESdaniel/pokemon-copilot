import { z } from "zod";
import { isValidGameForGeneration } from "./save.games.js";

export const createSaveSchema = z
  .object({
    name: z.string().min(1).max(80),
    game: z.string().min(1).max(40),
    generation: z.number().int().min(1).max(9),
  })
  .refine((data) => isValidGameForGeneration(data.game, data.generation), {
    message: "game does not belong to the given generation",
    path: ["game"],
  });

export type CreateSaveInput = z.infer<typeof createSaveSchema>;

export type SaveDTO = {
  id: string;
  name: string;
  game: string;
  generation: number;
  createdAt: Date;
};
