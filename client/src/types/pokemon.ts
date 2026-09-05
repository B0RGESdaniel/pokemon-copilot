import type { MoveComparisonDTO, MoveScoreDTO } from "./moveset";
import type { SpeciesDTO } from "./species";

export type PokemonLocation = "PARTY" | "PC";

export type PokemonDTO = {
  id: string;
  saveId: string;
  pokeApiId: number;
  nickname: string | null;
  level: number;
  heldItem: string | null;
  location: PokemonLocation;
  slotPosition: number | null;
  moves: string[];
  species: SpeciesDTO | null;
  createdAt: string;
  updatedAt: string;
};

export type LearnMoveResult =
  | {
      outcome: "learned_directly";
      pokemon: PokemonDTO;
      learnedMove: MoveScoreDTO;
    }
  | {
      outcome: "suggested_replacement";
      newMove: MoveScoreDTO;
      comparisons: MoveComparisonDTO[];
      suggestedReplacement: string;
    };
