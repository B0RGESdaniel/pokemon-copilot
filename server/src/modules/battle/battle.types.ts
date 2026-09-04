import { z } from "zod";
import type { LearnMoveResultDTO } from "../moveset/moveset.types.js";
import type { SpeciesDTO } from "../pokeapi/pokeapi.types.js";
import type { PokemonDTO } from "../pokemon/pokemon.types.js";

export const setOpponentSchema = z.object({
  pokeApiId: z.number().int().positive(),
  level: z.number().int().min(1).max(100),
});

export type SetOpponentInput = z.infer<typeof setOpponentSchema>;

export const setActivePokemonSchema = z.object({
  pokemonId: z.string().min(1),
});

export type SetActivePokemonInput = z.infer<typeof setActivePokemonSchema>;

export type OpponentDTO = {
  pokeApiId: number;
  level: number;
  species: SpeciesDTO | null;
};

export type MatchupVerdict = "favorable" | "unfavorable" | "neutral";

export type MatchupDTO = {
  offensiveMultiplier: number;
  defensiveMultiplier: number;
  score: number;
  verdict: MatchupVerdict;
};

export type BattleStateDTO = {
  saveId: string;
  activePokemon: PokemonDTO;
  opponent: OpponentDTO | null;
  matchup: MatchupDTO | null;
};

export type PartyMatchupDTO = {
  pokemon: PokemonDTO;
  matchup: MatchupDTO;
};

export type SwapSuggestionsDTO = {
  opponent: OpponentDTO;
  ranking: PartyMatchupDTO[];
};

export const levelUpSchema = z.object({
  level: z.number().int().min(1).max(100),
  moveName: z.string().min(1).optional(),
});

export type LevelUpInput = z.infer<typeof levelUpSchema>;

export type LevelUpResultDTO = {
  pokemon: PokemonDTO;
  moveEvaluation: LearnMoveResultDTO | null;
};
