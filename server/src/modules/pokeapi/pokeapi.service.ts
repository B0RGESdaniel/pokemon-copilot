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
  RawType,
  RawTypeRelations,
  SpeciesDTO,
  TypeChartDTO,
  TypeRelationsDTO,
} from "./pokeapi.types.js";

const NAME_LIST_LIMIT = 4000; // maior que o total de moves/items da PokeAPI hoje, então traz tudo numa página só.

// "unknown" (o tipo ???, removido depois da Gen 5) e "shadow" (só existe em
// Colosseum/XD, fora dos jogos principais) aparecem na lista de tipos da
// PokeAPI mas não são tipos reais de jogo principal — não fazem sentido
// num type chart por geração.
const NON_GAME_TYPES = new Set(["unknown", "shadow"]);

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

async function getTypeNames(): Promise<string[]> {
  const list = await cachedFetch<RawNamedResourceList>("type-list", () =>
    fetchFromPokeApi<RawNamedResourceList>(`/type?limit=${NAME_LIST_LIMIT}`),
  );
  return list.results.map((r) => r.name).filter((name) => !NON_GAME_TYPES.has(name));
}

async function getTypeRaw(name: string): Promise<RawType> {
  return cachedFetch<RawType>(`type:${name}`, () => fetchFromPokeApi<RawType>(`/type/${name}`));
}

// `past_damage_relations[].generation` é "a última geração em que essas
// relações valeram" (mesma convenção do PokemonTypePast da PokeAPI). Então
// pra achar as relações válidas numa geração alvo, pegamos a entrada de
// past_damage_relations com a MENOR generation que ainda seja >= à
// pedida (a revisão histórica mais próxima que cobre esse ponto no tempo).
// Se nenhuma cobrir, a geração alvo é posterior a todas as revisões
// históricas, então usamos damage_relations (a atual).
function relationsForGeneration(type: RawType, generation: number): RawTypeRelations {
  const applicablePast = type.past_damage_relations
    .map((p) => ({ generation: idFromUrl(p.generation.url), damageRelations: p.damage_relations }))
    .filter((p) => p.generation >= generation)
    .sort((a, b) => a.generation - b.generation);

  return applicablePast[0]?.damageRelations ?? type.damage_relations;
}

function toTypeRelationsDTO(raw: RawTypeRelations, validTypes: Set<string>): TypeRelationsDTO {
  const only = (list: { name: string }[]) => list.map((t) => t.name).filter((name) => validTypes.has(name));

  return {
    doubleDamageTo: only(raw.double_damage_to),
    halfDamageTo: only(raw.half_damage_to),
    noDamageTo: only(raw.no_damage_to),
    doubleDamageFrom: only(raw.double_damage_from),
    halfDamageFrom: only(raw.half_damage_from),
    noDamageFrom: only(raw.no_damage_from),
  };
}

// Cada tipo é cacheado individualmente (`type:{name}`), pra sempre. Depois
// da primeira chamada, montar o chart de qualquer geração é só leitura
// local + computação em memória — nenhuma chamada de rede.
export async function getTypeChartByGeneration(generation: number): Promise<TypeChartDTO> {
  const names = await getTypeNames();
  const allTypes = await Promise.all(names.map(getTypeRaw));

  const availableTypes = allTypes.filter((t) => idFromUrl(t.generation.url) <= generation);
  const validNames = new Set(availableTypes.map((t) => t.name));

  const relations: Record<string, TypeRelationsDTO> = {};
  for (const type of availableTypes) {
    relations[type.name] = toTypeRelationsDTO(relationsForGeneration(type, generation), validNames);
  }

  return {
    generation,
    types: [...validNames].sort(),
    relations,
  };
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
