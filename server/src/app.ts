import Fastify from "fastify";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFound.js";
import { pokemonRoutes } from "./modules/pokemon/pokemon.routes.js";

export const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.register(pokemonRoutes, { prefix: "/api" });

app.setNotFoundHandler(notFoundHandler);
app.setErrorHandler(errorHandler);
