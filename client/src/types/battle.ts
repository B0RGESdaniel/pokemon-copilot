import type { LearnMoveResult, PokemonDTO } from "./pokemon";
import type { SpeciesDTO } from "./species";

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

export type BattleStatus = "not_started" | "active" | "ended";

export type BattleState = {
  status: "active";
  saveId: string;
  activePokemon: PokemonDTO;
  opponent: OpponentDTO | null;
  matchup: MatchupDTO | null;
};

export type EndedBattle = {
  status: "ended";
  saveId: string;
  endReason: "opponent_fainted" | "fled";
  endedAt: string;
  activePokemon: PokemonDTO;
  opponent: OpponentDTO | null;
};

export type NotStartedBattle = { status: "not_started" };

export type BattleStatusResponse = BattleState | EndedBattle | NotStartedBattle;

export type PartyMatchup = {
  pokemon: PokemonDTO;
  matchup: MatchupDTO;
};

export type SwapSuggestions = {
  opponent: OpponentDTO;
  ranking: PartyMatchup[];
};

export type LevelUpResult = {
  pokemon: PokemonDTO;
  moveEvaluation: LearnMoveResult | null;
};
