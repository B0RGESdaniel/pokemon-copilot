import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

try {
  process.loadEnvFile(".env");
} catch {
  // sem .env (ex: variáveis já injetadas pelo ambiente de produção)
}

// Driver adapter (obrigatório a partir do Prisma 7). Trocar por
// @prisma/adapter-pg + DATABASE_URL do Postgres é a única mudança
// necessária aqui quando migrarmos de SQLite.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

export const prisma = new PrismaClient({ adapter });
