import { HttpError } from "../../middlewares/errorHandler.js";
import { getLearnableMovesInVersionGroup, getMove, getSpecies, getVersionGroupForGame } from "../pokeapi/pokeapi.service.js";
import type { MoveDTO } from "../pokeapi/pokeapi.types.js";
import { getPokemonById, updatePokemon } from "../pokemon/pokemon.service.js";
import { getSaveOrThrow } from "../save/save.service.js";
import type { DamageClass, LearnMoveResultDTO, MoveComparisonDTO, MoveScoreDTO } from "./moveset.types.js";

const MOVESET_SIZE = 4;

// Baseline usado tanto pra moves de status (sem power real) quanto pra
// moves ofensivos com power variável/desconhecido na PokeAPI (ex:
// seismic-toss, low-kick — dano depende de nível/peso, fora do escopo
// desta fase). É uma simplificação proposital: sem motor de dano
// completo, não dá pra pontuar esses casos "de verdade".
const BASELINE_POWER = 40;

const STAB_MULTIPLIER = 1.5;

// Prioridade vale mais pra pokémon lentos, que são quem mais se beneficia de
// agir antes independente do Speed. `SPEED_FLOOR` evita explodir o fator pra
// espécies com Speed muito baixo (ex: Shuckle).
const PRIORITY_BASE_BONUS = 12;
const SPEED_FLOOR = 20;
const SLOWNESS_MIN = 0.5;
const SLOWNESS_MAX = 2.5;

// Fator de "cobertura de dano": um move de status vale o valor cheio só
// quando o resto do set já tem pelo menos COVERAGE_FULL_AT moves de dano;
// com 0 ao redor, fica no piso COVERAGE_FLOOR — o suficiente pra nunca
// vencer um move de dano real, mesmo fraco (ver moveset.service.ts nos
// comentários de scoreMove pra o raciocínio completo).
const COVERAGE_FULL_AT = 2;
const COVERAGE_FLOOR = 0.25;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

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

function accuracyFactor(move: MoveDTO): number {
  return (move.accuracy ?? 100) / 100;
}

function slownessFactor(speed: number): number {
  return clamp(100 / Math.max(speed, SPEED_FLOOR), SLOWNESS_MIN, SLOWNESS_MAX);
}

// Quantos dos moves em `contextMoveNames` são de dano (não-status) nessa
// geração — usado só pra pontuar status (ver `coverage` em scoreMove).
// `generation` importa aqui pelo mesmo motivo de resolveDamageClass: a
// classificação físico/especial pré-Gen4 depende do tipo, não do move.
async function countDamageMoves(contextMoveNames: string[], generation: number): Promise<number> {
  if (contextMoveNames.length === 0) return 0;
  const moves = await Promise.all(contextMoveNames.map((name) => getMove(name)));
  return moves.filter((m) => resolveDamageClass(m.damageClass, m.type, generation) !== "status").length;
}

// `contextMoveNames` são os OUTROS moves do set final (não inclui o próprio
// `moveName`) — só afeta o score de moves de status, através do fator de
// cobertura: sem contexto (lista vazia), status fica no piso de cobertura.
export async function scoreMove(
  pokeApiId: number,
  moveName: string,
  generation: number,
  contextMoveNames: string[] = [],
): Promise<MoveScoreDTO> {
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
  const accFactor = accuracyFactor(move);

  let coverage = 1;
  if (isStatus) {
    const otherMoves = contextMoveNames.filter((n) => n.toLowerCase() !== moveName.toLowerCase());
    const damageMoveCount = await countDamageMoves(otherMoves, generation);
    coverage = clamp(damageMoveCount / COVERAGE_FULL_AT, COVERAGE_FLOOR, 1);
  }

  const slowness = slownessFactor(species.baseStats.speed);
  const prioBonus = move.priority > 0 ? PRIORITY_BASE_BONUS * move.priority * slowness : 0;
  const score = Math.round((power * stabMultiplier * statWeight * accFactor * coverage + prioBonus) * 100) / 100;

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
    if (coverage < 1) {
      reasons.push(`pouca cobertura de dano no time: status descontado (${Math.round(coverage * 100)}%)`);
    }
  }
  if (accFactor < 1) {
    reasons.push(`precisão ${move.accuracy}%: penalizado`);
  }
  if (prioBonus > 0) {
    const speedNote = slowness > 1 ? "Speed baixo: bônus alto" : "Speed já alto: bônus menor";
    reasons.push(`prioridade +${move.priority} (${speedNote})`);
  }

  return { move: move.name, type: move.type, damageClass, power, stab, statWeight, score, reasons };
}

// Greedy iterativo: a cada passo, repontua todos os candidatos restantes
// usando os moves JÁ escolhidos como contexto (essencial pro fator de
// cobertura de status fazer sentido — sem isso, um status ficaria preso ao
// piso de cobertura mesmo quando os outros 3 escolhidos já são dano). Dentro
// de cada passo, prefere um tipo ainda não usado; se não sobrar tipo novo
// (movepool pequeno/pouco diverso), relaxa e permite repetir. Se a espécie
// souber menos de 4 moves no jogo do save, devolve só o que existe — não há
// o que inventar.
export async function buildMoveset(saveId: string, pokeApiId: number): Promise<MoveScoreDTO[]> {
  const save = await getSaveOrThrow(saveId);
  const versionGroup = await getVersionGroupForGame(save.game);
  const learnable = [...(await getLearnableMovesInVersionGroup(pokeApiId, versionGroup))];

  const chosen: MoveScoreDTO[] = [];
  const usedTypes = new Set<string>();
  let remaining = learnable;

  while (chosen.length < MOVESET_SIZE && remaining.length > 0) {
    const context = chosen.map((c) => c.move);
    const scored = await Promise.all(
      remaining.map((moveName) => scoreMove(pokeApiId, moveName, save.generation, context)),
    );

    const diverse = scored.filter((m) => !usedTypes.has(m.type));
    const pool = diverse.length > 0 ? diverse : scored;
    const pick = pool.reduce((best, candidate) =>
      candidate.score > best.score || (candidate.score === best.score && candidate.move < best.move)
        ? candidate
        : best,
    );

    chosen.push(pick);
    usedTypes.add(pick.type);
    remaining = remaining.filter((name) => name !== pick.move);
  }

  return chosen;
}

// Reusa scoreMove pra decidir, entre dois moves específicos, qual pontua
// melhor pra essa espécie/geração — pensado pro fluxo de "aprendeu um move
// novo, troca por qual dos atuais?" (usado por evaluateNewMove, tanto na
// tela de Mudar Moves quanto no level up em batalha). `contextMoveNames`
// deve ser os OUTROS moves que permaneceriam no set independente de quem
// vencer essa comparação — ver evaluateNewMove pra como isso é montado.
export async function compareMoves(
  pokeApiId: number,
  moveNameA: string,
  moveNameB: string,
  generation: number,
  contextMoveNames: string[] = [],
): Promise<MoveComparisonDTO> {
  const [moveA, moveB] = await Promise.all([
    scoreMove(pokeApiId, moveNameA, generation, contextMoveNames),
    scoreMove(pokeApiId, moveNameB, generation, contextMoveNames),
  ]);

  const winner = moveA.score === moveB.score ? null : moveA.score > moveB.score ? moveA.move : moveB.move;

  return { moveA, moveB, winner };
}

// Fluxo manual de "aprender move novo" (sem detecção automática de level
// up) — reaproveitado tanto pela tela de Mudar Moves quanto pelo contexto
// de batalha (ver battle.service.ts::levelUp). Só recebe pokemonId +
// moveName; o Pokémon já sabe seu próprio saveId/pokeApiId.
export async function evaluateNewMove(pokemonId: string, moveName: string): Promise<LearnMoveResultDTO> {
  const pokemon = await getPokemonById(pokemonId);
  const save = await getSaveOrThrow(pokemon.saveId);
  const normalizedMoveName = moveName.toLowerCase();

  const versionGroup = await getVersionGroupForGame(save.game);
  const learnable = await getLearnableMovesInVersionGroup(pokemon.pokeApiId, versionGroup);
  if (!learnable.has(normalizedMoveName)) {
    throw new HttpError(
      400,
      `Move "${moveName}" is not learnable by species ${pokemon.pokeApiId} in "${save.game}" (version group "${versionGroup}")`,
    );
  }

  if (pokemon.moves.some((m) => m.toLowerCase() === normalizedMoveName)) {
    throw new HttpError(400, `Pokemon ${pokemonId} already knows move "${moveName}"`);
  }

  if (pokemon.moves.length < MOVESET_SIZE) {
    // Nada sai do set aqui — o contexto pro fator de cobertura é o moveset
    // atual inteiro.
    const learnedMove = await scoreMove(pokemon.pokeApiId, normalizedMoveName, save.generation, pokemon.moves);
    const updated = await updatePokemon(pokemonId, { moves: [...pokemon.moves, learnedMove.move] });
    return { outcome: "learned_directly", pokemon: updated, learnedMove };
  }

  // Score "de vitrine" pro move novo, calculado com o moveset atual como
  // contexto — só informativo. A decisão de fato usa `comparisons` abaixo,
  // onde cada par é pontuado com o contexto que RESULTARIA da troca (os
  // outros 3 moves, excluindo o candidato à saída) — é isso que faz um
  // status não vencer o único move de dano do set.
  const newMove = await scoreMove(pokemon.pokeApiId, normalizedMoveName, save.generation, pokemon.moves);
  const comparisons = await Promise.all(
    pokemon.moves.map((currentMove) => {
      const context = pokemon.moves.filter((m) => m !== currentMove);
      return compareMoves(pokemon.pokeApiId, normalizedMoveName, currentMove, save.generation, context);
    }),
  );
  // Só sugere trocar um move que o novo de fato supera na comparação (não
  // só "o mais fraco dos 4 por score bruto" — como cada comparação usa um
  // contexto ligeiramente diferente, moveA.score varia entre elas). Se o
  // novo move não vence nenhuma, ele é mais fraco que o moveset inteiro e
  // não há sugestão de troca — mas o usuário ainda pode forçar manualmente
  // tocando em qualquer move na lista (comparisons continua completo).
  const beatable = comparisons.filter((c) => c.winner === newMove.move);
  const weakest =
    beatable.length > 0
      ? beatable.reduce((min, c) => (c.moveB.score < min.moveB.score ? c : min))
      : null;

  return {
    outcome: "suggested_replacement",
    newMove,
    comparisons,
    suggestedReplacement: weakest?.moveB.move ?? null,
  };
}
