import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { getEvolutions, getLegalMoves, getMove, getSpecies, searchItems } from "../api/species";

export function useSpecies(pokeApiId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.species(pokeApiId ?? 0),
    queryFn: () => getSpecies(pokeApiId as number),
    enabled: !!pokeApiId,
  });

  return { species: data ?? null, loading: isLoading };
}

export function useEvolutions(pokeApiId: number | null) {
  const { data } = useQuery({
    queryKey: queryKeys.evolutions(pokeApiId ?? 0),
    queryFn: () => getEvolutions(pokeApiId as number),
    enabled: !!pokeApiId,
  });

  return { evolutions: data ?? [] };
}

export function useMove(name: string | null) {
  const { data } = useQuery({
    queryKey: queryKeys.move(name ?? ""),
    queryFn: () => getMove(name as string),
    enabled: !!name,
    staleTime: Infinity,
  });

  return data ?? null;
}

export function useSearchItems(search: string) {
  const q = search.trim().toLowerCase();
  const { data } = useQuery({
    queryKey: queryKeys.items(q),
    queryFn: () => searchItems(q),
    enabled: q.length > 0,
    staleTime: Infinity,
  });

  return data ?? [];
}

export function useLegalMoves(saveId: string | null, pokeApiId: number | null) {
  const { data } = useQuery({
    queryKey: queryKeys.legalMoves(saveId ?? "", pokeApiId ?? 0),
    queryFn: () => getLegalMoves(saveId as string, pokeApiId as number),
    enabled: !!saveId && !!pokeApiId,
    staleTime: Infinity,
  });

  return data ?? [];
}
