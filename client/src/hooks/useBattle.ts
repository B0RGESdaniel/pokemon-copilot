import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  battleLevelUp,
  endBattle,
  getBattleStatus,
  getBattleSuggestions,
  setBattleActive,
  setBattleOpponent,
  startBattle,
} from "../api/battle";
import { queryKeys } from "../api/queryKeys";
import type { BattleStatusResponse } from "../types/battle";

export function useBattle(saveId: string | null) {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: queryKeys.battle(saveId ?? ""),
    queryFn: () => getBattleStatus(saveId as string),
    enabled: !!saveId,
  });

  const setStatus = (data: BattleStatusResponse) => {
    if (saveId) queryClient.setQueryData(queryKeys.battle(saveId), data);
  };

  const startMutation = useMutation({
    mutationFn: () => startBattle(saveId as string),
    onSuccess: setStatus,
  });

  const setOpponentMutation = useMutation({
    mutationFn: ({ pokeApiId, level }: { pokeApiId: number; level: number }) =>
      setBattleOpponent(saveId as string, pokeApiId, level),
    onSuccess: setStatus,
  });

  const setActiveMutation = useMutation({
    mutationFn: (pokemonId: string) => setBattleActive(saveId as string, pokemonId),
    onSuccess: setStatus,
  });

  const endMutation = useMutation({
    mutationFn: (reason: "opponent_fainted" | "fled") => endBattle(saveId as string, reason),
    onSuccess: setStatus,
  });

  const levelUpMutation = useMutation({
    mutationFn: ({ level, moveName }: { level: number; moveName?: string }) =>
      battleLevelUp(saveId as string, level, moveName),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["battle"] }),
        queryClient.invalidateQueries({ queryKey: ["party"] }),
      ]);
    },
  });

  return {
    status: status ?? null,
    loading: isLoading,
    start: () => startMutation.mutateAsync(),
    setOpponent: (pokeApiId: number, level: number) => setOpponentMutation.mutateAsync({ pokeApiId, level }),
    setActive: (pokemonId: string) => setActiveMutation.mutateAsync(pokemonId),
    end: (reason: "opponent_fainted" | "fled") => endMutation.mutateAsync(reason),
    levelUp: (level: number, moveName?: string) => levelUpMutation.mutateAsync({ level, moveName }),
  };
}

export function useBattleSuggestions(saveId: string | null) {
  const { data } = useQuery({
    queryKey: queryKeys.battleSuggestions(saveId ?? ""),
    queryFn: () => getBattleSuggestions(saveId as string),
    enabled: !!saveId,
  });

  return data ?? null;
}
