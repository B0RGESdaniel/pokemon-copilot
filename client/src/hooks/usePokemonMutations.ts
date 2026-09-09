import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  addToParty,
  addToPc,
  deletePokemon,
  learnMove,
  movePokemon,
  updatePokemon,
  type CreatePokemonInput,
  type UpdatePokemonInput,
} from "../api/pokemon";

function usePokemonInvalidation() {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["party"] }),
      queryClient.invalidateQueries({ queryKey: ["pc"] }),
      queryClient.invalidateQueries({ queryKey: ["battle"] }),
    ]);
  }, [queryClient]);
}

export function useAddToParty() {
  const invalidate = usePokemonInvalidation();
  return useMutation({
    mutationFn: (input: CreatePokemonInput) => addToParty(input),
    onSuccess: invalidate,
  });
}

export function useAddToPc() {
  const invalidate = usePokemonInvalidation();
  return useMutation({
    mutationFn: (input: Omit<CreatePokemonInput, "slotPosition">) => addToPc(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePokemon() {
  const invalidate = usePokemonInvalidation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePokemonInput }) => updatePokemon(id, input),
    onSuccess: invalidate,
  });
}

export function useMovePokemon() {
  const invalidate = usePokemonInvalidation();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: "PARTY" | "PC" }) => movePokemon(id, to),
    onSuccess: invalidate,
  });
}

export function useDeletePokemon() {
  const invalidate = usePokemonInvalidation();
  return useMutation({
    mutationFn: (id: string) => deletePokemon(id),
    onSuccess: invalidate,
  });
}

export function useLearnMove() {
  const invalidate = usePokemonInvalidation();
  return useMutation({
    mutationFn: ({ id, moveName }: { id: string; moveName: string }) => learnMove(id, moveName),
    onSuccess: invalidate,
  });
}
