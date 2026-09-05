import { get, post, put } from "./client";
import type { BattleStatusResponse, EndedBattle, LevelUpResult, SwapSuggestions } from "../types/battle";

export const getBattleStatus = (saveId: string) => get<BattleStatusResponse>(`/saves/${saveId}/battle`);
export const startBattle = (saveId: string) => post<BattleStatusResponse>(`/saves/${saveId}/battle`);
export const setBattleOpponent = (saveId: string, pokeApiId: number, level: number) =>
  put<BattleStatusResponse>(`/saves/${saveId}/battle/opponent`, { pokeApiId, level });
export const setBattleActive = (saveId: string, pokemonId: string) =>
  put<BattleStatusResponse>(`/saves/${saveId}/battle/active`, { pokemonId });
export const getBattleSuggestions = (saveId: string) => get<SwapSuggestions>(`/saves/${saveId}/battle/suggestions`);
export const battleLevelUp = (saveId: string, level: number, moveName?: string) =>
  put<LevelUpResult>(`/saves/${saveId}/battle/level-up`, moveName ? { level, moveName } : { level });
export const endBattle = (saveId: string, reason: "opponent_fainted" | "fled") =>
  post<EndedBattle>(`/saves/${saveId}/battle/end`, { reason });
