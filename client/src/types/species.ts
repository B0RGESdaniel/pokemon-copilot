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

export type GenerationSpeciesEntry = {
  pokeApiId: number;
  name: string;
};

export type TypeRelations = {
  doubleDamageTo: string[];
  halfDamageTo: string[];
  noDamageTo: string[];
  doubleDamageFrom: string[];
  halfDamageFrom: string[];
  noDamageFrom: string[];
};

export type TypeChart = {
  generation: number;
  types: string[];
  relations: Record<string, TypeRelations>;
};

export type EvolutionOption = {
  pokeApiId: number;
  name: string;
  method: string;
};
