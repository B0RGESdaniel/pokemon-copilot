import { tv } from "tailwind-variants";
import type { TypeChart } from "../types/species";

// Mesma matemática do backend (moves/battle.service.ts::multiplierAgainst) —
// só leitura sobre o type chart já buscado, sem chamada de rede extra.
export function multiplierAgainst(
  attackingType: string,
  defendingTypes: string[],
  chart: TypeChart,
): number {
  return defendingTypes.reduce((mult, def) => {
    const rel = chart.relations[def];
    if (!rel) return mult;
    if (rel.noDamageFrom.includes(attackingType)) return mult * 0;
    if (rel.doubleDamageFrom.includes(attackingType)) return mult * 2;
    if (rel.halfDamageFrom.includes(attackingType)) return mult * 0.5;
    return mult;
  }, 1);
}

const effectivenessTier = tv({
  variants: {
    tier: {
      immune: "bg-text-muted text-white",
      resisted: "bg-red text-white",
      neutral: "bg-border text-text-muted",
      superEffective: "bg-green-soft text-ink",
      veryEffective: "bg-green text-ink",
    },
  },
});

export function effectivenessBadge(value: number): {
  label: string;
  className: string;
} {
  if (value === 0) return { label: "x0", className: effectivenessTier({ tier: "immune" }) };
  if (value >= 2) return { label: `x${value}`, className: effectivenessTier({ tier: "veryEffective" }) };
  if (value > 1) return { label: `x${value}`, className: effectivenessTier({ tier: "superEffective" }) };
  if (value === 1) return { label: "x1", className: effectivenessTier({ tier: "neutral" }) };
  return { label: `x${value}`, className: effectivenessTier({ tier: "resisted" }) };
}
