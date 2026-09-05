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
