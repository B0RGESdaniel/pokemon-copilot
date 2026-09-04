import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import type { CreateSaveInput, SaveDTO } from "./save.types.js";

export async function listSaves(): Promise<SaveDTO[]> {
  return prisma.save.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createSave(input: CreateSaveInput): Promise<SaveDTO> {
  return prisma.save.create({ data: input });
}

export async function getSaveOrThrow(id: string): Promise<SaveDTO> {
  const save = await prisma.save.findUnique({ where: { id } });
  if (!save) {
    throw new HttpError(404, `Save ${id} not found`);
  }
  return save;
}
