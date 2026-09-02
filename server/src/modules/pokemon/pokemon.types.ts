import { z } from "zod";

export const POKEMON_LOCATIONS = ["PARTY", "PC"] as const;

export type PokemonLocation = (typeof POKEMON_LOCATIONS)[number];

export const MAX_PARTY_SIZE = 6;

export const createPartyPokemonSchema = z.object({
  pokeApiId: z.number().int().positive(),
  nickname: z.string().min(1).max(50).optional(),
  level: z.number().int().min(1).max(100),
  heldItem: z.string().min(1).max(50).optional(),
  moves: z.array(z.string().min(1)).max(4).default([]),
  slotPosition: z.number().int().min(1).max(MAX_PARTY_SIZE).optional(),
});

export type CreatePartyPokemonInput = z.infer<typeof createPartyPokemonSchema>;

export const updatePokemonSchema = z.object({
  nickname: z.string().min(1).max(50).nullable().optional(),
  level: z.number().int().min(1).max(100).optional(),
  heldItem: z.string().min(1).max(50).nullable().optional(),
  moves: z.array(z.string().min(1)).max(4).optional(),
});

export type UpdatePokemonInput = z.infer<typeof updatePokemonSchema>;

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
