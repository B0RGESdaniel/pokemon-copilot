import Fastify from "fastify";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFound.js";

export const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.setNotFoundHandler(notFoundHandler);
app.setErrorHandler(errorHandler);
