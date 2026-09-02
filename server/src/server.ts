import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3333);

try {
  await app.listen({ port });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
