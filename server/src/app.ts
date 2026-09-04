import cors from "@fastify/cors";
import Fastify from "fastify";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFound.js";
import { battleRoutes } from "./modules/battle/battle.routes.js";
import { movesetRoutes } from "./modules/moveset/moveset.routes.js";
import { pokeapiRoutes } from "./modules/pokeapi/pokeapi.routes.js";
import { pokemonRoutes } from "./modules/pokemon/pokemon.routes.js";
import { saveRoutes } from "./modules/save/save.routes.js";
import { validationRoutes } from "./modules/validation/validation.routes.js";

export const app = Fastify({ logger: true });

// Libera o dev server do Vite (frontend roda em porta separada da API).
// methods precisa ser explícito — o default do @fastify/cors só inclui
// GET/HEAD/POST, o que bloqueava silenciosamente PUT/PATCH/DELETE no
// preflight (a API usa os quatro).
await app.register(cors, {
  origin: ["http://localhost:5173"],
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

app.get("/health", async () => ({ status: "ok" }));

app.register(pokemonRoutes, { prefix: "/api" });
app.register(pokeapiRoutes, { prefix: "/api" });
app.register(saveRoutes, { prefix: "/api" });
app.register(validationRoutes, { prefix: "/api" });
app.register(battleRoutes, { prefix: "/api" });
app.register(movesetRoutes, { prefix: "/api" });

app.setNotFoundHandler(notFoundHandler);
app.setErrorHandler(errorHandler);
