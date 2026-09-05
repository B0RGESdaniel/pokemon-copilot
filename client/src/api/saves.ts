import { get, post } from "./client";
import type { Save } from "../types/saves";

export const listSaves = () => get<Save[]>("/saves");
export const createSave = (input: { name: string; game: string; generation: number }) =>
  post<Save>("/saves", input);
