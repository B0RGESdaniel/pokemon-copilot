export type Save = {
  id: string;
  name: string;
  game: string;
  generation: number;
  createdAt: string;
};

export type PokemonLocation = "PARTY" | "PC";

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

export type ValidationIssue = {
  code: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

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

export type DamageClass = "physical" | "special" | "status";

export type MoveScoreDTO = {
  move: string;
  type: string;
  damageClass: DamageClass;
  power: number;
  stab: boolean;
  statWeight: number;
  score: number;
  reasons: string[];
};

export type MoveComparisonDTO = {
  moveA: MoveScoreDTO;
  moveB: MoveScoreDTO;
  winner: string | null;
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

export type LevelUpResult = {
  pokemon: PokemonDTO;
  moveEvaluation: LearnMoveResult | null;
};
