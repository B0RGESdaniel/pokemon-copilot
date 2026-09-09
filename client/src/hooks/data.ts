import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { queryKeys } from "../api/queryKeys";
import { createSave, listSaves } from "../api/saves";
import { getParty, getPc } from "../api/pokemon";
import { getSpeciesByGeneration, getTypeChart } from "../api/species";
import type { Save } from "../types/saves";

const SAVE_STORAGE_KEY = "pokemon-copilot:saveId";

export function useSaves() {
  const queryClient = useQueryClient();
  const { data: saves, isLoading } = useQuery({ queryKey: queryKeys.saves, queryFn: listSaves });
  const [selectedId, setSelectedId] = useState<string | null>(() => localStorage.getItem(SAVE_STORAGE_KEY));

  const select = useCallback((id: string) => {
    localStorage.setItem(SAVE_STORAGE_KEY, id);
    setSelectedId(id);
  }, []);

  const createMutation = useMutation({
    mutationFn: createSave,
    onSuccess: (created) => {
      queryClient.setQueryData<Save[]>(queryKeys.saves, (prev) => (prev ? [...prev, created] : [created]));
      select(created.id);
    },
  });

  const selected = saves?.find((s) => s.id === selectedId) ?? saves?.[0] ?? null;

  useEffect(() => {
    if (selected && selected.id !== selectedId) localStorage.setItem(SAVE_STORAGE_KEY, selected.id);
  }, [selected, selectedId]);

  return {
    saves: saves ?? null,
    loading: isLoading,
    selected,
    select,
    create: createMutation.mutateAsync,
  };
}

export function useParty(saveId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.party(saveId ?? ""),
    queryFn: () => getParty(saveId as string),
    enabled: !!saveId,
  });

  return { party: data ?? [], loading: isLoading };
}

export function usePc(saveId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.pc(saveId ?? ""),
    queryFn: () => getPc(saveId as string),
    enabled: !!saveId,
  });

  return { pc: data ?? [], loading: isLoading };
}

export function useGenerationDex(generation: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dex(generation ?? 0),
    queryFn: () => getSpeciesByGeneration(generation as number),
    enabled: !!generation,
    staleTime: Infinity,
  });

  return { dex: data ?? [], loading: isLoading };
}

export function useTypeChart(generation: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.typeChart(generation ?? 0),
    queryFn: () => getTypeChart(generation as number),
    enabled: !!generation,
    staleTime: Infinity,
  });

  return { chart: data ?? null, loading: isLoading };
}
