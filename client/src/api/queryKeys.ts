export const queryKeys = {
  saves: ["saves"] as const,
  party: (saveId: string) => ["party", saveId] as const,
  pc: (saveId: string) => ["pc", saveId] as const,
  dex: (generation: number) => ["dex", generation] as const,
  typeChart: (generation: number) => ["typeChart", generation] as const,
  battle: (saveId: string) => ["battle", saveId] as const,
  battleSuggestions: (saveId: string) => ["battle", saveId, "suggestions"] as const,
  species: (pokeApiId: number) => ["species", pokeApiId] as const,
  evolutions: (pokeApiId: number) => ["evolutions", pokeApiId] as const,
  move: (name: string) => ["move", name] as const,
  items: (search: string) => ["items", search] as const,
  legalMoves: (saveId: string, pokeApiId: number) => ["legalMoves", saveId, pokeApiId] as const,
};
