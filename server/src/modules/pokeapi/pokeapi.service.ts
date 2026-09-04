import { cachedFetch } from "../../lib/pokeapi/cache.js";
import { fetchFromPokeApi } from "../../lib/pokeapi/client.js";
import type {
  GenerationSpeciesDTO,
  ItemDTO,
  MoveDTO,
  RawGeneration,
  RawItem,
  RawMove,
  RawNamedResourceList,
  RawPokemon,
  SpeciesDTO,
} from "./pokeapi.types.js";

const NAME_LIST_LIMIT = 4000; // maior que o total de moves/items da PokeAPI hoje, então traz tudo numa página só.

function baseStat(stats: RawPokemon["stats"], name: string): number {
  return stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
}

// URLs de Named APIResource da PokeAPI têm o formato .../resource/{id}/ —
// não tem outro jeito de extrair o id sem essa convenção.
function idFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match) {
    throw new Error(`Cannot extract id from PokeAPI url: ${url}`);
  }
  return Number(match[1]);
}

function toSpeciesDTO(raw: RawPokemon): SpeciesDTO {
  return {
    pokeApiId: raw.id,
    name: raw.name,
    types: raw.types.map((t) => t.type.name),
    sprite: raw.sprites.other?.["official-artwork"]?.front_default ?? raw.sprites.front_default,
    learnableMoves: raw.moves.map((m) => m.move.name).sort(),
    baseStats: {
      hp: baseStat(raw.stats, "hp"),
      attack: baseStat(raw.stats, "attack"),
      defense: baseStat(raw.stats, "defense"),
      specialAttack: baseStat(raw.stats, "special-attack"),
      specialDefense: baseStat(raw.stats, "special-defense"),
      speed: baseStat(raw.stats, "speed"),
    },
  };
}

function toMoveDTO(raw: RawMove): MoveDTO {
  return {
    name: raw.name,
    type: raw.type.name,
    power: raw.power,
    accuracy: raw.accuracy,
    pp: raw.pp,
    damageClass: raw.damage_class?.name ?? null,
  };
}

function toItemDTO(raw: RawItem): ItemDTO {
  const englishEntry = raw.effect_entries.find((e) => e.language.name === "en");
  return {
    name: raw.name,
    sprite: raw.sprites.default,
    category: raw.category.name,
    shortEffect: englishEntry?.short_effect ?? null,
  };
}

export async function getSpecies(pokeApiId: number): Promise<SpeciesDTO> {
  const raw = await cachedFetch<RawPokemon>(`pokemon:${pokeApiId}`, () =>
    fetchFromPokeApi<RawPokemon>(`/pokemon/${pokeApiId}`),
  );
  return toSpeciesDTO(raw);
}

export async function getMove(name: string): Promise<MoveDTO> {
  const key = name.toLowerCase();
  const raw = await cachedFetch<RawMove>(`move:${key}`, () =>
    fetchFromPokeApi<RawMove>(`/move/${key}`),
  );
  return toMoveDTO(raw);
}

export async function getItem(name: string): Promise<ItemDTO> {
  const key = name.toLowerCase();
  const raw = await cachedFetch<RawItem>(`item:${key}`, () =>
    fetchFromPokeApi<RawItem>(`/item/${key}`),
  );
  return toItemDTO(raw);
}

async function getGenerationRaw(generation: number): Promise<RawGeneration> {
  return cachedFetch<RawGeneration>(`generation:${generation}`, () =>
    fetchFromPokeApi<RawGeneration>(`/generation/${generation}`),
  );
}

// `/generation/{n}` só devolve espécies introduzidas NAQUELA geração (ex:
// generation 4 não inclui Bulbasaur). Um save de Platinum (Gen 4) pode ter
// Pokémon de Gen 1 a 4, então aqui unimos todas as gerações de 1 até a
// pedida — cada uma cacheada individualmente e para sempre, então depois
// da primeira vez isso é só leitura local.
export async function getSpeciesByGeneration(generation: number): Promise<GenerationSpeciesDTO[]> {
  const generations = await Promise.all(
    Array.from({ length: generation }, (_, i) => getGenerationRaw(i + 1)),
  );

  const species = generations.flatMap((gen) =>
    gen.pokemon_species.map((s) => ({ pokeApiId: idFromUrl(s.url), name: s.name })),
  );

  return species.sort((a, b) => a.pokeApiId - b.pokeApiId);
}

// Só items têm busca global — moves são sempre consultados no contexto de
// uma espécie específica (ver SpeciesDTO.learnableMoves), então não faz
// sentido buscar entre os ~900 moves do jogo inteiro.
export async function searchItemNames(query: string): Promise<string[]> {
  const list = await cachedFetch<RawNamedResourceList>("item-list", () =>
    fetchFromPokeApi<RawNamedResourceList>(`/item?limit=${NAME_LIST_LIMIT}`),
  );

  const needle = query.toLowerCase();
  return list.results
    .map((r) => r.name)
    .filter((name) => name.includes(needle))
    .slice(0, 20);
}
