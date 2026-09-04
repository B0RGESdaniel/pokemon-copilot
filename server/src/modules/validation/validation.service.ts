import {
  getLearnableMovesInVersionGroup,
  getSpeciesByGeneration,
  getVersionGroupForGame,
} from "../pokeapi/pokeapi.service.js";
import { getSaveOrThrow } from "../save/save.service.js";
import type { ValidatePokemonInput, ValidationIssue, ValidationResultDTO } from "./validation.types.js";

// getSpeciesByGeneration já é cumulativo (Gen 1 até a pedida), então isso
// bloqueia só espécies de gerações futuras (ex: um Pokémon de Gen 6 num
// save de Gen 4) — não espécies de gerações anteriores.
async function validateSpecies(pokeApiId: number, generation: number): Promise<ValidationIssue[]> {
  const species = await getSpeciesByGeneration(generation);
  const exists = species.some((s) => s.pokeApiId === pokeApiId);

  if (exists) {
    return [];
  }

  return [
    {
      code: "SPECIES_NOT_IN_GENERATION",
      message: `Species ${pokeApiId} does not exist up to generation ${generation}`,
    },
  ];
}

// save.game resolve pro version_group exato do jogo (ver
// getVersionGroupForGame) — mais preciso que validar só pela generation,
// já que uma generation agrupa vários jogos com movesets diferentes entre
// si (ex: Gen 4 = diamond-pearl, platinum, heartgold-soulsilver).
async function validateMoves(pokeApiId: number, moves: string[], game: string): Promise<ValidationIssue[]> {
  if (moves.length === 0) {
    return [];
  }

  const versionGroup = await getVersionGroupForGame(game);
  const learnable = await getLearnableMovesInVersionGroup(pokeApiId, versionGroup);

  return moves
    .filter((move) => !learnable.has(move.toLowerCase()))
    .map((move) => ({
      code: "MOVE_NOT_LEARNABLE" as const,
      message: `Move "${move}" is not learnable by species ${pokeApiId} in "${game}" (version group "${versionGroup}")`,
    }));
}

export async function validatePokemonForSave(
  saveId: string,
  input: ValidatePokemonInput,
): Promise<ValidationResultDTO> {
  const save = await getSaveOrThrow(saveId);

  const issues = [
    ...(await validateSpecies(input.pokeApiId, save.generation)),
    ...(await validateMoves(input.pokeApiId, input.moves, save.game)),
  ];

  return { valid: issues.length === 0, issues };
}
