import { getLearnableMovesInVersionGroup, getMove, getSpecies, getVersionGroupForGame } from "../pokeapi/pokeapi.service.js";
import type { MoveDTO } from "../pokeapi/pokeapi.types.js";
import { getSaveOrThrow } from "../save/save.service.js";
import type { DamageClass, MoveComparisonDTO, MoveScoreDTO } from "./moveset.types.js";

const MOVESET_SIZE = 4;

// Baseline usado tanto pra moves de status (sem power real) quanto pra
// moves ofensivos com power variável/desconhecido na PokeAPI (ex:
// seismic-toss, low-kick — dano depende de nível/peso, fora do escopo
// desta fase). É uma simplificação proposital: sem motor de dano
// completo, não dá pra pontuar esses casos "de verdade".
const BASELINE_POWER = 40;

const STAB_MULTIPLIER = 1.5;

// O split físico/especial por MOVE só existe a partir da Gen 4. Antes
// disso, a categoria era determinada pelo TIPO do move — a PokeAPI não
// guarda isso historicamente (damage_class é sempre a classificação
// atual/moderna, sem past_values pra esse campo), então é uma tabela
// fixa. Steel e Dark só existem a partir da Gen 2.
const PRE_SPLIT_PHYSICAL_TYPES = new Set([
  "normal",
  "fighting",
  "flying",
  "ground",
  "rock",
  "bug",
  "ghost",
  "poison",
  "steel",
]);
const PRE_SPLIT_SPECIAL_TYPES = new Set([
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "psychic",
  "dragon",
  "dark",
]);

// Bônus por categoria pra moves de status, usando só o que a PokeAPI já
// classifica (meta.category/healing/stat_changes) — não é curadoria manual
// por move, então não diferencia utilidade dentro da mesma categoria (ex:
// não sabe que Stealth Rock costuma valer mais que Swagger, ambos "unique"
// ou sem categoria com sinal).
function statusMoveBonus(move: MoveDTO): number {
  if (move.category === "ailment") {
    return 20; // causa uma condição de status (poison/paralysis/burn/sleep/freeze)
  }
  if (move.category === "heal") {
    return move.healing * 0.4; // Recover (healing=50) -> +20
  }
  if (move.category === "net-good-stats") {
    const netChange = move.statChanges.reduce((sum, sc) => sum + sc.change, 0);
    // Auto-buff (Swords Dance, net positivo) pesa mais que debuff no
    // oponente (Growl, net negativo) — ambos compartilham essa categoria.
    return Math.abs(netChange) * (netChange > 0 ? 10 : 5);
  }
  return 0; // field-effect, unique, force-switch etc — sem sinal suficiente pra diferenciar
}

function resolveDamageClass(rawDamageClass: string | null, moveType: string, generation: number): DamageClass {
  if (rawDamageClass === "status") {
    return "status";
  }

  if (generation >= 4) {
    return (rawDamageClass ?? "status") as DamageClass;
  }

  if (PRE_SPLIT_PHYSICAL_TYPES.has(moveType)) return "physical";
  if (PRE_SPLIT_SPECIAL_TYPES.has(moveType)) return "special";
  return (rawDamageClass ?? "status") as DamageClass;
}

export async function scoreMove(pokeApiId: number, moveName: string, generation: number): Promise<MoveScoreDTO> {
  const [species, move] = await Promise.all([getSpecies(pokeApiId), getMove(moveName)]);

  const damageClass = resolveDamageClass(move.damageClass, move.type, generation);
  const isStatus = damageClass === "status";

  // STAB só existe pra dano — não se aplica a moves de status mesmo
  // quando o tipo bate com o da espécie.
  const stab = !isStatus && species.types.includes(move.type);
  const stabMultiplier = stab ? STAB_MULTIPLIER : 1;
  const power = isStatus ? BASELINE_POWER + statusMoveBonus(move) : (move.power ?? BASELINE_POWER);
  const relevantStat = damageClass === "special" ? species.baseStats.specialAttack : species.baseStats.attack;
  const statWeight = isStatus ? 1 : relevantStat / 100;
  const score = Math.round(power * stabMultiplier * statWeight * 100) / 100;

  const reasons: string[] = [damageClass === "physical" ? "físico" : damageClass === "special" ? "especial" : "status"];
  if (stab) reasons.push("STAB");
  if (!isStatus && move.power === null) {
    reasons.push("power variável/desconhecido — usando baseline");
  }
  if (damageClass === "physical" && species.baseStats.attack > species.baseStats.specialAttack) {
    reasons.push("compatível com Attack alto");
  } else if (damageClass === "special" && species.baseStats.specialAttack > species.baseStats.attack) {
    reasons.push("compatível com Sp. Attack alto");
  }
  if (isStatus) {
    if (move.category === "ailment" && move.ailment) {
      reasons.push(`causa ${move.ailment}`);
    } else if (move.category === "heal" && move.healing > 0) {
      reasons.push(`cura ${move.healing}% HP`);
    } else if (move.category === "net-good-stats" && move.statChanges.length > 0) {
      const netChange = move.statChanges.reduce((sum, sc) => sum + sc.change, 0);
      reasons.push(netChange > 0 ? "melhora stats próprios" : "reduz stats do oponente");
    }
  }

  return { move: move.name, type: move.type, damageClass, power, stab, statWeight, score, reasons };
}

// Greedy: pega o melhor score, depois o melhor score seguinte cujo tipo
// ainda não esteja no set (evita repetir tipo). Se não sobrar tipo novo
// antes de completar 4 (movepool pequeno/pouco diverso), relaxa a
// restrição e completa com os melhores scores restantes, repetindo tipo
// se precisar. Se a espécie souber menos de 4 moves no jogo do save,
// devolve só o que existe — não há o que inventar.
export async function buildMoveset(saveId: string, pokeApiId: number): Promise<MoveScoreDTO[]> {
  const save = await getSaveOrThrow(saveId);
  const versionGroup = await getVersionGroupForGame(save.game);
  const learnable = await getLearnableMovesInVersionGroup(pokeApiId, versionGroup);

  const scored = await Promise.all(
    [...learnable].map((moveName) => scoreMove(pokeApiId, moveName, save.generation)),
  );
  scored.sort((a, b) => b.score - a.score || a.move.localeCompare(b.move));

  const chosen: MoveScoreDTO[] = [];
  const usedTypes = new Set<string>();

  for (const candidate of scored) {
    if (chosen.length >= MOVESET_SIZE) break;
    if (!usedTypes.has(candidate.type)) {
      chosen.push(candidate);
      usedTypes.add(candidate.type);
    }
  }

  if (chosen.length < MOVESET_SIZE) {
    for (const candidate of scored) {
      if (chosen.length >= MOVESET_SIZE) break;
      if (!chosen.includes(candidate)) {
        chosen.push(candidate);
      }
    }
  }

  return chosen;
}

// Reusa scoreMove pra decidir, entre dois moves específicos, qual pontua
// melhor pra essa espécie/geração — pensado pro fluxo de "aprendeu um move
// novo, troca por qual dos atuais?" (próximo prompt, level up). Nenhuma
// integração com level up é feita aqui, só a função pronta.
export async function compareMoves(
  pokeApiId: number,
  moveNameA: string,
  moveNameB: string,
  generation: number,
): Promise<MoveComparisonDTO> {
  const [moveA, moveB] = await Promise.all([
    scoreMove(pokeApiId, moveNameA, generation),
    scoreMove(pokeApiId, moveNameB, generation),
  ]);

  const winner = moveA.score === moveB.score ? null : moveA.score > moveB.score ? moveA.move : moveB.move;

  return { moveA, moveB, winner };
}
