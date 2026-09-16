// Curated by hand against the PokeAPI /generation and /version-group data
// (checked 2026-09-16), not fetched live — past generations never change,
// and this filters out entries that would silently break the app anyway:
// - Japanese-exclusive version variants (red-green-japan, blue-japan):
//   redundant with red/blue.
// - Colosseum/XD (gen 3 console spin-offs): restricted roster, not a
//   real "which game is this save" answer for a living-dex tracker.
// - DLC-only version groups (the-isle-of-armor-*, the-crown-tundra-*,
//   the-teal-mask-*, the-indigo-disk-*): not a distinct base game, the
//   save is still "sword"/"shield" or "scarlet"/"violet".
// - legends-za, mega-dimension (gen 9): PokeAPI has no move-learn-method
//   data for them yet, so moveset suggestions would silently return
//   nothing for every pokemon.
// - champions (gen 9): has move data, but unclear if it's a mainline
//   save-tracking game or a battle-facility spin-off — left out until
//   confirmed.
export const GENERATION_GAMES: Record<number, { value: string; label: string }[]> = {
  1: [
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "yellow", label: "Yellow" },
  ],
  2: [
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Silver" },
    { value: "crystal", label: "Crystal" },
  ],
  3: [
    { value: "ruby", label: "Ruby" },
    { value: "sapphire", label: "Sapphire" },
    { value: "emerald", label: "Emerald" },
    { value: "firered", label: "FireRed" },
    { value: "leafgreen", label: "LeafGreen" },
  ],
  4: [
    { value: "diamond", label: "Diamond" },
    { value: "pearl", label: "Pearl" },
    { value: "platinum", label: "Platinum" },
    { value: "heartgold", label: "HeartGold" },
    { value: "soulsilver", label: "SoulSilver" },
  ],
  5: [
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
    { value: "black-2", label: "Black 2" },
    { value: "white-2", label: "White 2" },
  ],
  6: [
    { value: "x", label: "X" },
    { value: "y", label: "Y" },
    { value: "omega-ruby", label: "Omega Ruby" },
    { value: "alpha-sapphire", label: "Alpha Sapphire" },
  ],
  7: [
    { value: "sun", label: "Sun" },
    { value: "moon", label: "Moon" },
    { value: "ultra-sun", label: "Ultra Sun" },
    { value: "ultra-moon", label: "Ultra Moon" },
    { value: "lets-go-pikachu", label: "Let's Go, Pikachu!" },
    { value: "lets-go-eevee", label: "Let's Go, Eevee!" },
  ],
  8: [
    { value: "sword", label: "Sword" },
    { value: "shield", label: "Shield" },
    { value: "brilliant-diamond", label: "Brilliant Diamond" },
    { value: "shining-pearl", label: "Shining Pearl" },
    { value: "legends-arceus", label: "Legends: Arceus" },
  ],
  9: [
    { value: "scarlet", label: "Scarlet" },
    { value: "violet", label: "Violet" },
  ],
};

export function isValidGameForGeneration(game: string, generation: number): boolean {
  return (GENERATION_GAMES[generation] ?? []).some((g) => g.value === game);
}
