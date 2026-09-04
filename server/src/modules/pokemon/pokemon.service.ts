import { Prisma } from "@prisma/client";
import type { Pokemon } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import { getSpecies } from "../pokeapi/pokeapi.service.js";
import { getSaveOrThrow } from "../save/save.service.js";
import {
  MAX_PARTY_SIZE,
  type CreatePartyPokemonInput,
  type CreatePcPokemonInput,
  type MovePokemonInput,
  type PokemonDTO,
  type PokemonLocation,
  type UpdatePokemonInput,
} from "./pokemon.types.js";

// A espécie vem da PokeAPI (cacheada) só pra enriquecer a resposta. Se a
// PokeAPI estiver fora do ar, não queremos que isso derrube o CRUD do
// nosso próprio dado — devolve species: null nesse caso.
async function toDTO(pokemon: Pokemon): Promise<PokemonDTO> {
  const species = await getSpecies(pokemon.pokeApiId).catch(() => null);

  return {
    ...pokemon,
    location: pokemon.location as PokemonLocation,
    moves: JSON.parse(pokemon.moves) as string[],
    species,
  };
}

export async function getPokemonById(id: string): Promise<PokemonDTO> {
  const pokemon = await prisma.pokemon.findUnique({ where: { id } });
  if (!pokemon) {
    throw new HttpError(404, `Pokemon ${id} not found`);
  }
  return toDTO(pokemon);
}

export async function getParty(saveId: string): Promise<PokemonDTO[]> {
  const party = await prisma.pokemon.findMany({
    where: { saveId, location: "PARTY" },
    orderBy: { slotPosition: "asc" },
  });

  return Promise.all(party.map(toDTO));
}

export async function getPC(saveId: string): Promise<PokemonDTO[]> {
  const pc = await prisma.pokemon.findMany({
    where: { saveId, location: "PC" },
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(pc.map(toDTO));
}

async function resolveSlotPosition(saveId: string, requestedSlot: number | undefined): Promise<number> {
  const occupiedSlots = await prisma.pokemon.findMany({
    where: { saveId, location: "PARTY" },
    select: { slotPosition: true },
  });
  const occupied = new Set(occupiedSlots.map((p) => p.slotPosition));

  if (requestedSlot !== undefined) {
    if (occupied.has(requestedSlot)) {
      throw new HttpError(409, `Slot ${requestedSlot} is already occupied in the party`);
    }
    return requestedSlot;
  }

  if (occupied.size >= MAX_PARTY_SIZE) {
    throw new HttpError(409, `Party is full (max ${MAX_PARTY_SIZE} pokemon)`);
  }

  for (let slot = 1; slot <= MAX_PARTY_SIZE; slot++) {
    if (!occupied.has(slot)) {
      return slot;
    }
  }

  throw new HttpError(409, `Party is full (max ${MAX_PARTY_SIZE} pokemon)`);
}

export async function addToParty(input: CreatePartyPokemonInput): Promise<PokemonDTO> {
  await getSaveOrThrow(input.saveId);
  const slotPosition = await resolveSlotPosition(input.saveId, input.slotPosition);

  try {
    const created = await prisma.pokemon.create({
      data: {
        saveId: input.saveId,
        pokeApiId: input.pokeApiId,
        nickname: input.nickname ?? null,
        level: input.level,
        heldItem: input.heldItem ?? null,
        location: "PARTY",
        slotPosition,
        moves: JSON.stringify(input.moves),
      },
    });

    return toDTO(created);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, `Slot ${slotPosition} is already occupied in the party`);
    }
    throw err;
  }
}

// Registra direto na PC, sem lógica de slot (PC não tem slots) — usado
// quando a party já está cheia no momento do cadastro.
export async function addToPc(input: CreatePcPokemonInput): Promise<PokemonDTO> {
  await getSaveOrThrow(input.saveId);

  const created = await prisma.pokemon.create({
    data: {
      saveId: input.saveId,
      pokeApiId: input.pokeApiId,
      nickname: input.nickname ?? null,
      level: input.level,
      heldItem: input.heldItem ?? null,
      location: "PC",
      slotPosition: null,
      moves: JSON.stringify(input.moves),
    },
  });

  return toDTO(created);
}

export async function updatePokemon(id: string, input: UpdatePokemonInput): Promise<PokemonDTO> {
  const data: Prisma.PokemonUpdateInput = {};

  if (input.nickname !== undefined) data.nickname = input.nickname;
  if (input.level !== undefined) data.level = input.level;
  if (input.heldItem !== undefined) data.heldItem = input.heldItem;
  if (input.moves !== undefined) data.moves = JSON.stringify(input.moves);
  if (input.pokeApiId !== undefined) data.pokeApiId = input.pokeApiId;

  try {
    const updated = await prisma.pokemon.update({ where: { id }, data });
    return toDTO(updated);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw new HttpError(404, `Pokemon ${id} not found`);
    }
    throw err;
  }
}

export async function movePokemon(id: string, input: MovePokemonInput): Promise<PokemonDTO> {
  const existing = await prisma.pokemon.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, `Pokemon ${id} not found`);
  }

  if (existing.location === input.to) {
    throw new HttpError(400, `Pokemon is already in ${input.to}`);
  }

  const data: Prisma.PokemonUpdateInput =
    input.to === "PARTY"
      ? {
          location: "PARTY",
          slotPosition: await resolveSlotPosition(existing.saveId, input.slotPosition),
        }
      : { location: "PC", slotPosition: null };

  try {
    const updated = await prisma.pokemon.update({ where: { id }, data });
    return toDTO(updated);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        throw new HttpError(409, "Slot is already occupied in the party");
      }
      if (err.code === "P2025") {
        throw new HttpError(404, `Pokemon ${id} not found`);
      }
    }
    throw err;
  }
}

export async function deletePokemon(id: string): Promise<void> {
  try {
    await prisma.pokemon.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw new HttpError(404, `Pokemon ${id} not found`);
    }
    throw err;
  }
}
