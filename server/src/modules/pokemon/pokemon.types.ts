export const POKEMON_LOCATIONS = ["PARTY", "PC"] as const;

export type PokemonLocation = (typeof POKEMON_LOCATIONS)[number];

export type PokemonDTO = {
  id: string;
  pokeApiId: number;
  nickname: string | null;
  level: number;
  heldItem: string | null;
  location: PokemonLocation;
  slotPosition: number | null;
  moves: string[];
  createdAt: Date;
  updatedAt: Date;
};
