import type { TypeChart } from "./types";

// Mesma matemática do backend (moves/battle.service.ts::multiplierAgainst) —
// só leitura sobre o type chart já buscado, sem chamada de rede extra.
export function multiplierAgainst(attackingType: string, defendingTypes: string[], chart: TypeChart): number {
  return defendingTypes.reduce((mult, def) => {
    const rel = chart.relations[def];
    if (!rel) return mult;
    if (rel.noDamageFrom.includes(attackingType)) return mult * 0;
    if (rel.doubleDamageFrom.includes(attackingType)) return mult * 2;
    if (rel.halfDamageFrom.includes(attackingType)) return mult * 0.5;
    return mult;
  }, 1);
}

export function effectivenessBadge(value: number): { label: string; bg: string; fg: string } {
  if (value === 0) return { label: "x0", bg: "#3c4a66", fg: "#f2f6ff" };
  if (value >= 2) return { label: `x${value}`, bg: "#5aa943", fg: "#0b1120" };
  if (value > 1) return { label: `x${value}`, bg: "#cfe3c4", fg: "#0b1120" };
  if (value === 1) return { label: "x1", bg: "#e4e9f2", fg: "#3c4a66" };
  return { label: `x${value}`, bg: "#c03830", fg: "#f2f6ff" };
}
