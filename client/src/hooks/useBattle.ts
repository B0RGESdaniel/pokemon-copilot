import { useCallback, useEffect, useState } from "react";
import { battleLevelUp, endBattle, getBattleStatus, setBattleActive, setBattleOpponent, startBattle } from "../api";
import type { BattleStatusResponse } from "../types";

export function useBattle(saveId: string | null) {
  const [status, setStatus] = useState<BattleStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!saveId) return;
    setLoading(true);
    try {
      setStatus(await getBattleStatus(saveId));
    } finally {
      setLoading(false);
    }
  }, [saveId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const start = useCallback(async () => {
    if (!saveId) return;
    setStatus(await startBattle(saveId));
  }, [saveId]);

  const setOpponent = useCallback(
    async (pokeApiId: number, level: number) => {
      if (!saveId) return;
      setStatus(await setBattleOpponent(saveId, pokeApiId, level));
    },
    [saveId],
  );

  const setActive = useCallback(
    async (pokemonId: string) => {
      if (!saveId) return;
      setStatus(await setBattleActive(saveId, pokemonId));
    },
    [saveId],
  );

  const end = useCallback(
    async (reason: "opponent_fainted" | "fled") => {
      if (!saveId) return;
      setStatus(await endBattle(saveId, reason));
    },
    [saveId],
  );

  // O resultado do level-up tem um formato diferente do estado de batalha
  // (inclui a avaliação do move novo) — por isso recarrega o status geral
  // à parte, em vez de tentar reaproveitar a resposta como novo `status`.
  const levelUp = useCallback(
    async (level: number, moveName?: string) => {
      if (!saveId) throw new Error("No save selected");
      const result = await battleLevelUp(saveId, level, moveName);
      await reload();
      return result;
    },
    [saveId, reload],
  );

  return { status, loading, start, setOpponent, setActive, end, levelUp, reload };
}
