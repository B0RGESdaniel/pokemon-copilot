import type { FastifyInstance } from "fastify";
import { createSaveHandler, getSaveHandler, listSavesHandler } from "./save.controller.js";

export async function saveRoutes(app: FastifyInstance): Promise<void> {
  app.get("/saves", listSavesHandler);
  app.get("/saves/:id", getSaveHandler);
  app.post("/saves", createSaveHandler);
}
