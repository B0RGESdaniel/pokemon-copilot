import type { BattleSession } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import { evaluateNewMove } from "../moveset/moveset.service.js";
import { getSpecies, getTypeChartByGeneration } from "../pokeapi/pokeapi.service.js";
import type { TypeChartDTO } from "../pokeapi/pokeapi.types.js";
import { getParty, getPokemonById, updatePokemon } from "../pokemon/pokemon.service.js";
import { getSaveOrThrow } from "../save/save.service.js";
import type {
  BattleStateDTO,
  BattleStatusDTO,
  EndBattleInput,
  EndBattleReason,
  EndedBattleDTO,
  LevelUpInput,
  LevelUpResultDTO,
  MatchupDTO,
  OpponentDTO,
  PartyMatchupDTO,
  SetActivePokemonInput,
  SetOpponentInput,
  SwapSuggestionsDTO,
} from "./battle.types.js";

const BATTLE_NOT_ACTIVE_MESSAGE = "Battle not started for this save — call POST /battle first";

// Multiplicador de dano de `attackingType` contra a combinação (1 ou 2
// tipos) de `defendingTypes`, segundo o type chart da geração do save.
// Se um tipo não existir ainda naquela geração (ex: fairy num save de Gen
// 4 — ver nota em toBattleStateDTO), trata como neutro em vez de quebrar.
function multiplierAgainst(attackingType: string, defendingTypes: string[], chart: TypeChartDTO): number {
  return defendingTypes.reduce((multiplier, defendingType) => {
    const relations = chart.relations[defendingType];
    if (!relations) {
      return multiplier;
    }
    if (relations.noDamageFrom.includes(attackingType)) return multiplier * 0;
    if (relations.doubleDamageFrom.includes(attackingType)) return multiplier * 2;
    if (relations.halfDamageFrom.includes(attackingType)) return multiplier * 0.5;
    return multiplier;
  }, 1);
}

// Ofensivo = meu melhor multiplicador possível contra ele (assumindo que eu
// bato com o tipo mais vantajoso que eu tiver). Defensivo = o pior hit que
// ele pode me dar. Score = ofensivo - defensivo (positivo é bom pra mim).
function computeMatchup(myTypes: string[], opponentTypes: string[], chart: TypeChartDTO): MatchupDTO {
  const offensiveMultiplier = Math.max(...myTypes.map((t) => multiplierAgainst(t, opponentTypes, chart)));
  const defensiveMultiplier = Math.max(...opponentTypes.map((t) => multiplierAgainst(t, myTypes, chart)));
  const score = offensiveMultiplier - defensiveMultiplier;

  return {
    offensiveMultiplier,
    defensiveMultiplier,
    score,
    verdict: score > 0 ? "favorable" : score < 0 ? "unfavorable" : "neutral",
  };
}

// A espécie do adversário usa o tipo ATUAL (não histórico) — mesma
// simplificação que o resto do app já assume (ex: getSpecies em
// pokemon.service.ts). Um Clefairy num save de Gen 4 aparece como Fairy
// mesmo sendo Normal naquela época de verdade. Se a PokeAPI estiver fora
// do ar, species vem null em vez de derrubar o estado da batalha.
async function toOpponentDTO(pokeApiId: number | null, level: number | null): Promise<OpponentDTO | null> {
  if (pokeApiId === null || level === null) {
    return null;
  }
  const species = await getSpecies(pokeApiId).catch(() => null);
  return { pokeApiId, level, species };
}

async function toBattleStateDTO(session: BattleSession, generation: number): Promise<BattleStateDTO> {
  const [activePokemon, opponent] = await Promise.all([
    getPokemonById(session.activePokemonId),
    toOpponentDTO(session.opponentPokeApiId, session.opponentLevel),
  ]);

  if (!opponent) {
    return { status: "active", saveId: session.saveId, activePokemon, opponent: null, matchup: null };
  }

  const chart = await getTypeChartByGeneration(generation);
  const matchup =
    activePokemon.species && opponent.species
      ? computeMatchup(activePokemon.species.types, opponent.species.types, chart)
      : null;

  return { status: "active", saveId: session.saveId, activePokemon, opponent, matchup };
}

async function toEndedBattleDTO(session: BattleSession): Promise<EndedBattleDTO> {
  const [activePokemon, opponent] = await Promise.all([
    getPokemonById(session.activePokemonId),
    toOpponentDTO(session.opponentPokeApiId, session.opponentLevel),
  ]);

  return {
    status: "ended",
    saveId: session.saveId,
    endReason: session.endReason as EndBattleReason,
    endedAt: session.endedAt as Date,
    activePokemon,
    opponent,
  };
}

// "Iniciar batalha" sempre reseta pro slot 1 da party e limpa o adversário
// — não guardamos histórico de batalhas nesta fase, só o estado atual.
export async function startBattle(saveId: string): Promise<BattleStateDTO> {
  const save = await getSaveOrThrow(saveId);

  const party = await getParty(saveId);
  const slotOne = party.find((p) => p.slotPosition === 1);
  if (!slotOne) {
    throw new HttpError(409, "Party slot 1 is empty, cannot start a battle");
  }

  const session = await prisma.battleSession.upsert({
    where: { saveId },
    create: { saveId, activePokemonId: slotOne.id },
    update: {
      activePokemonId: slotOne.id,
      opponentPokeApiId: null,
      opponentLevel: null,
      status: "active",
      endReason: null,
      endedAt: null,
    },
  });

  return toBattleStateDTO(session, save.generation);
}

export async function setOpponent(saveId: string, input: SetOpponentInput): Promise<BattleStateDTO> {
  const save = await getSaveOrThrow(saveId);

  const existing = await prisma.battleSession.findUnique({ where: { saveId } });
  if (!existing || existing.status !== "active") {
    throw new HttpError(409, BATTLE_NOT_ACTIVE_MESSAGE);
  }

  const session = await prisma.battleSession.update({
    where: { saveId },
    data: { opponentPokeApiId: input.pokeApiId, opponentLevel: input.level },
  });

  return toBattleStateDTO(session, save.generation);
}

export async function setActivePokemon(saveId: string, input: SetActivePokemonInput): Promise<BattleStateDTO> {
  const save = await getSaveOrThrow(saveId);

  const existing = await prisma.battleSession.findUnique({ where: { saveId } });
  if (!existing || existing.status !== "active") {
    throw new HttpError(409, BATTLE_NOT_ACTIVE_MESSAGE);
  }

  const candidate = await getPokemonById(input.pokemonId);
  if (candidate.saveId !== saveId || candidate.location !== "PARTY") {
    throw new HttpError(400, `Pokemon ${input.pokemonId} is not in this save's party`);
  }

  const session = await prisma.battleSession.update({
    where: { saveId },
    data: { activePokemonId: candidate.id },
  });

  return toBattleStateDTO(session, save.generation);
}

// Ranking do time inteiro (não só o ativo) contra o adversário atual, do
// melhor pro pior matchup. Pokémon cuja espécie não deu pra enriquecer
// (PokeAPI fora do ar) ficam de fora do ranking — sem tipos não dá pra
// avaliar matchup.
export async function getSwapSuggestions(saveId: string): Promise<SwapSuggestionsDTO> {
  const save = await getSaveOrThrow(saveId);

  const session = await prisma.battleSession.findUnique({ where: { saveId } });
  if (!session || session.status !== "active") {
    throw new HttpError(409, BATTLE_NOT_ACTIVE_MESSAGE);
  }
  if (session.opponentPokeApiId === null || session.opponentLevel === null) {
    throw new HttpError(409, "Opponent not set — call PUT /battle/opponent first");
  }

  const [party, opponentSpecies, chart] = await Promise.all([
    getParty(saveId),
    getSpecies(session.opponentPokeApiId),
    getTypeChartByGeneration(save.generation),
  ]);

  const ranking = party
    .filter((pokemon): pokemon is typeof pokemon & { species: NonNullable<(typeof pokemon)["species"]> } =>
      pokemon.species !== null,
    )
    .map(
      (pokemon): PartyMatchupDTO => ({
        pokemon,
        matchup: computeMatchup(pokemon.species.types, opponentSpecies.types, chart),
      }),
    )
    .sort((a, b) => b.matchup.score - a.matchup.score);

  return {
    opponent: { pokeApiId: session.opponentPokeApiId, level: session.opponentLevel, species: opponentSpecies },
    ranking,
  };
}

// Aviso manual de "subiu de nível" no meio da batalha — sem detecção
// automática (decisão explícita do Prompt F: nível é só um campo editável,
// sem lógica acoplada). Sempre atualiza o nível do Pokémon ativo via o
// mesmo updatePokemon que a tela de Mudar Moves usa; se um move novo foi
// informado, reaproveita evaluateNewMove (mesma função da tela fora de
// batalha) pra avaliar/aprender.
export async function levelUp(saveId: string, input: LevelUpInput): Promise<LevelUpResultDTO> {
  await getSaveOrThrow(saveId);

  const session = await prisma.battleSession.findUnique({ where: { saveId } });
  if (!session || session.status !== "active") {
    throw new HttpError(409, BATTLE_NOT_ACTIVE_MESSAGE);
  }

  const updated = await updatePokemon(session.activePokemonId, { level: input.level });

  if (!input.moveName) {
    return { pokemon: updated, moveEvaluation: null };
  }

  const moveEvaluation = await evaluateNewMove(session.activePokemonId, input.moveName);
  const pokemon = moveEvaluation.outcome === "learned_directly" ? moveEvaluation.pokemon : updated;

  return { pokemon, moveEvaluation };
}

// Encerra a batalha (adversário desmaiou ou fugiu) sem deletar a linha —
// vira uma transição de estado. A próxima "iniciar batalha" sobrescreve
// esses dados (não guardamos histórico de batalhas nesta fase).
export async function endBattle(saveId: string, input: EndBattleInput): Promise<EndedBattleDTO> {
  await getSaveOrThrow(saveId);

  const session = await prisma.battleSession.findUnique({ where: { saveId } });
  if (!session || session.status !== "active") {
    throw new HttpError(409, BATTLE_NOT_ACTIVE_MESSAGE);
  }

  const ended = await prisma.battleSession.update({
    where: { saveId },
    data: { status: "ended", endReason: input.reason, endedAt: new Date() },
  });

  return toEndedBattleDTO(ended);
}

// Leitura pura, sem efeito colateral — pensada pro frontend perguntar "tem
// batalha rolando?" ao abrir a tela, sem correr o risco de resetar uma
// batalha ativa (o que POST /battle faria).
export async function getBattleStatus(saveId: string): Promise<BattleStatusDTO> {
  const save = await getSaveOrThrow(saveId);

  const session = await prisma.battleSession.findUnique({ where: { saveId } });
  if (!session) {
    return { status: "not_started" };
  }
  if (session.status === "ended") {
    return toEndedBattleDTO(session);
  }

  return toBattleStateDTO(session, save.generation);
}
