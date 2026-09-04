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
  moves: {
    move: { name: string };
    version_group_details: { version_group: { name: string } }[];
  }[];
};

// Só o campo necessário pra chegar na evolution chain a partir de um id.
export type RawPokemonSpecies = {
  evolution_chain: { url: string };
};

export type RawEvolutionDetail = {
  min_level: number | null;
  item: { name: string } | null;
  trigger: { name: string } | null;
  min_happiness: number | null;
  held_item: { name: string } | null;
  location: { name: string } | null;
};

export type RawEvolutionChainNode = {
  species: { name: string; url: string };
  evolves_to: RawEvolutionChainNode[];
  evolution_details: RawEvolutionDetail[];
};

export type RawEvolutionChain = {
  chain: RawEvolutionChainNode;
};

// `/version/{name}` — save.game (ex: "platinum") bate direto com o nome
// desse recurso, o que permite resolver o version_group exato do jogo sem
// precisar de uma tabela de mapeamento escrita à mão.
export type RawVersion = {
  id: number;
  name: string;
  version_group: { name: string; url: string };
};

export type RawMove = {
  name: string;
  type: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damage_class: { name: string } | null;
  // Sinal útil pra pontuar moves de status (sem power real) — ver
  // moveset.service.ts. `meta` é null em pouquíssimos moves obscuros.
  meta: { category: { name: string }; healing: number; ailment: { name: string } } | null;
  stat_changes: { change: number; stat: { name: string } }[];
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
  category: string | null;
  ailment: string | null;
  healing: number;
  statChanges: { change: number; stat: string }[];
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

export type EvolutionOptionDTO = {
  pokeApiId: number;
  name: string;
  method: string;
};
