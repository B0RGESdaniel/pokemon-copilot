FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# valor fictício: prisma.config.ts exige DATABASE_URL resolvível pra
# validar o config, mas `prisma generate` não conecta no banco de fato.
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# node_modules inteiro (incl. devDeps) é copiado de propósito: a CLI do
# prisma (devDependency) precisa estar disponível em runtime pra migration
# no entrypoint.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3333
# migration roda aqui (no boot da própria máquina da app) em vez de via
# `release_command` do Fly: release_command roda numa máquina efêmera à
# parte que não tem o volume /data montado, então as migrations aplicavam
# num SQLite descartável e a app real subia com o banco do volume vazio.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
