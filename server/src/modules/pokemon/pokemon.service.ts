import type { Pokemon } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { PokemonDTO, PokemonLocation } from "./pokemon.types.js";

function toDTO(pokemon: Pokemon): PokemonDTO {
  return {
    ...pokemon,
    location: pokemon.location as PokemonLocation,
    moves: JSON.parse(pokemon.moves) as string[],
  };
}

export async function getParty(): Promise<PokemonDTO[]> {
  const party = await prisma.pokemon.findMany({
    where: { location: "PARTY" },
    orderBy: { slotPosition: "asc" },
  });

  return party.map(toDTO);
}
