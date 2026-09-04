import { useCallback, useEffect, useState } from "react";
import { createSave, getParty, getPc, getSpeciesByGeneration, getTypeChart, listSaves } from "../api";
import type { GenerationSpeciesEntry, PokemonDTO, Save, TypeChart } from "../types";

const SAVE_STORAGE_KEY = "pokemon-copilot:saveId";

export function useSaves() {
  const [saves, setSaves] = useState<Save[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => localStorage.getItem(SAVE_STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await listSaves();
    setSaves(list);
    return list;
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const select = useCallback((id: string) => {
    localStorage.setItem(SAVE_STORAGE_KEY, id);
    setSelectedId(id);
  }, []);

  const create = useCallback(
    async (input: { name: string; game: string; generation: number }) => {
      const created = await createSave(input);
      setSaves((prev) => (prev ? [...prev, created] : [created]));
      select(created.id);
      return created;
    },
    [select],
  );

  const selected = saves?.find((s) => s.id === selectedId) ?? saves?.[0] ?? null;

  useEffect(() => {
    if (selected && selected.id !== selectedId) select(selected.id);
  }, [selected, selectedId, select]);

  return { saves, loading, selected, select, create };
}

export function useParty(saveId: string | null) {
  const [data, setData] = useState<PokemonDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!saveId) return;
    setLoading(true);
    try {
      setData(await getParty(saveId));
    } finally {
      setLoading(false);
    }
  }, [saveId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { party: data, loading, reload };
}

export function usePc(saveId: string | null) {
  const [data, setData] = useState<PokemonDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!saveId) return;
    setLoading(true);
    try {
      setData(await getPc(saveId));
    } finally {
      setLoading(false);
    }
  }, [saveId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { pc: data, loading, reload };
}

const dexCache = new Map<number, GenerationSpeciesEntry[]>();

export function useGenerationDex(generation: number | null) {
  const [dex, setDex] = useState<GenerationSpeciesEntry[]>(generation ? (dexCache.get(generation) ?? []) : []);
  const [loading, setLoading] = useState(!!generation && !dexCache.has(generation));

  useEffect(() => {
    if (!generation) return;
    const cached = dexCache.get(generation);
    if (cached) {
      setDex(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSpeciesByGeneration(generation)
      .then((list) => {
        dexCache.set(generation, list);
        setDex(list);
      })
      .finally(() => setLoading(false));
  }, [generation]);

  return { dex, loading };
}

const typeChartCache = new Map<number, TypeChart>();

export function useTypeChart(generation: number | null) {
  const [chart, setChart] = useState<TypeChart | null>(generation ? (typeChartCache.get(generation) ?? null) : null);
  const [loading, setLoading] = useState(!!generation && !typeChartCache.has(generation));

  useEffect(() => {
    if (!generation) return;
    const cached = typeChartCache.get(generation);
    if (cached) {
      setChart(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    getTypeChart(generation)
      .then((c) => {
        typeChartCache.set(generation, c);
        setChart(c);
      })
      .finally(() => setLoading(false));
  }, [generation]);

  return { chart, loading };
}
