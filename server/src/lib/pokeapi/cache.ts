import { prisma } from "../prisma.js";

// Espécie, move e item da PokeAPI não mudam — por isso o cache não tem TTL.
// Se algum dia precisar invalidar, é um DELETE direto na tabela por enquanto.
export async function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = await prisma.pokeApiCacheEntry.findUnique({ where: { key } });
  if (cached) {
    return JSON.parse(cached.payload) as T;
  }

  const data = await fetcher();

  await prisma.pokeApiCacheEntry.upsert({
    where: { key },
    create: { key, payload: JSON.stringify(data) },
    update: { payload: JSON.stringify(data), fetchedAt: new Date() },
  });

  return data;
}
