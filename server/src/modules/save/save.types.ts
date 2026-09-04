import { z } from "zod";

export const createSaveSchema = z.object({
  name: z.string().min(1).max(80),
  game: z.string().min(1).max(40),
  generation: z.number().int().min(1).max(9),
});

export type CreateSaveInput = z.infer<typeof createSaveSchema>;

export type SaveDTO = {
  id: string;
  name: string;
  game: string;
  generation: number;
  createdAt: Date;
};
