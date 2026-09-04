// Shapes crus da PokeAPI — só os campos que a gente de fato consome.

export type RawPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
};

export type RawMove = {
  name: string;
  type: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damage_class: { name: string } | null;
};

export type RawItem = {
  name: string;
  sprites: { default: string | null };
  category: { name: string };
  effect_entries: { short_effect: string; language: { name: string } }[];
};

export type RawNamedResourceList = {
  count: number;
  results: { name: string; url: string }[];
};

// `pokemon_species` aqui são só as espécies introduzidas NESSA geração
// específica (não cumulativo) — ver getSpeciesByGeneration.
export type RawGeneration = {
  id: number;
  name: string;
  pokemon_species: { name: string; url: string }[];
};

export type RawTypeRelations = {
  no_damage_to: { name: string; url: string }[];
  half_damage_to: { name: string; url: string }[];
  double_damage_to: { name: string; url: string }[];
  no_damage_from: { name: string; url: string }[];
  half_damage_from: { name: string; url: string }[];
  double_damage_from: { name: string; url: string }[];
};

// `damage_relations` é sempre a relação ATUAL (mais recente). Mudanças
// históricas ficam em `past_damage_relations`, onde `generation` é a
// última geração em que aquelas relações valeram (mesma convenção do
// PokemonTypePast da PokeAPI) — ver getTypeChartByGeneration.
export type RawType = {
  id: number;
  name: string;
  generation: { name: string; url: string };
  damage_relations: RawTypeRelations;
  past_damage_relations: {
    generation: { name: string; url: string };
    damage_relations: RawTypeRelations;
  }[];
};

// DTOs curados, devolvidos pela nossa API.

export type SpeciesDTO = {
  pokeApiId: number;
  name: string;
  types: string[];
  sprite: string | null;
  learnableMoves: string[];
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
};

export type MoveDTO = {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string | null;
};

export type ItemDTO = {
  name: string;
  sprite: string | null;
  category: string;
  shortEffect: string | null;
};

export type GenerationSpeciesDTO = {
  pokeApiId: number;
  name: string;
};

export type TypeRelationsDTO = {
  doubleDamageTo: string[];
  halfDamageTo: string[];
  noDamageTo: string[];
  doubleDamageFrom: string[];
  halfDamageFrom: string[];
  noDamageFrom: string[];
};

export type TypeChartDTO = {
  generation: number;
  types: string[];
  relations: Record<string, TypeRelationsDTO>;
};
