import Fastify from "fastify";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFound.js";
import { pokeapiRoutes } from "./modules/pokeapi/pokeapi.routes.js";
import { pokemonRoutes } from "./modules/pokemon/pokemon.routes.js";
import { saveRoutes } from "./modules/save/save.routes.js";
import { validationRoutes } from "./modules/validation/validation.routes.js";

export const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.register(pokemonRoutes, { prefix: "/api" });
app.register(pokeapiRoutes, { prefix: "/api" });
app.register(saveRoutes, { prefix: "/api" });
app.register(validationRoutes, { prefix: "/api" });

app.setNotFoundHandler(notFoundHandler);
app.setErrorHandler(errorHandler);
