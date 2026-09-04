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
  status: "active";
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

export const END_BATTLE_REASONS = ["opponent_fainted", "fled"] as const;

export type EndBattleReason = (typeof END_BATTLE_REASONS)[number];

export const endBattleSchema = z.object({
  reason: z.enum(END_BATTLE_REASONS),
});

export type EndBattleInput = z.infer<typeof endBattleSchema>;

export type EndedBattleDTO = {
  status: "ended";
  saveId: string;
  endReason: EndBattleReason;
  endedAt: Date;
  activePokemon: PokemonDTO;
  opponent: OpponentDTO | null;
};

export type NotStartedBattleDTO = {
  status: "not_started";
};

export type BattleStatusDTO = BattleStateDTO | EndedBattleDTO | NotStartedBattleDTO;
