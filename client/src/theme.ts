export const PIX = { fontFamily: "'Press Start 2P', monospace" };
export const VT = { fontFamily: "'VT323', monospace" };

export const colors = {
  ink: "#0b1120",
  navy: "#22355e",
  navyDark: "#16233f",
  navyLight: "#3a5a97",
  bg: "#dfe4ee",
  bgAlt: "#c9d2e2",
  panel: "#f7f9fc",
  panelAlt: "#e8edf7",
  frame: "#d5dded",
  frameAlt: "#b3c1d8",
  slotEmpty: "#bcc6d8",
  border: "#e4e9f2",
  text: "#0b1120",
  textMuted: "#3c4a66",
  textFaint: "#6a768c",
  textDim: "#8b96ab",
  white: "#f2f6ff",
  blue: "#3a6ec0",
  blueLight: "#6d9adf",
  blueSoft: "#8ba7d6",
  blueSofter: "#b9cdea",
  red: "#c03830",
  redSoft: "#f7e3e1",
  yellow: "#e6c422",
  yellowLight: "#f6e07a",
  yellowSoft: "#f9f2cf",
  green: "#5aa943",
  greenSoft: "#cfe3c4",
  headerHint: "#9fc4f0",
  navInactive: "#7c89a3",
} as const;

export const typeColors: Record<string, readonly [string, string]> = {
  fire: ["#e2762f", "#0b1120"],
  water: ["#4f86dd", "#f2f6ff"],
  grass: ["#5aa943", "#0b1120"],
  electric: ["#e6c422", "#0b1120"],
  normal: ["#bcbca8", "#0b1120"],
  flying: ["#9a8ce0", "#0b1120"],
  poison: ["#8e3c96", "#f2f6ff"],
  ghost: ["#63528c", "#f2f6ff"],
  fighting: ["#b02c26", "#f2f6ff"],
  psychic: ["#e04f7c", "#f2f6ff"],
  dark: ["#5f4c3f", "#f2f6ff"],
  steel: ["#a8b0c4", "#0b1120"],
  ground: ["#d2b054", "#0b1120"],
  ice: ["#87c9cd", "#0b1120"],
  dragon: ["#6231e0", "#f2f6ff"],
  rock: ["#b6a163", "#0b1120"],
  bug: ["#9aad2a", "#0b1120"],
  fairy: ["#e59ac0", "#0b1120"],
  stellar: ["#7fd8c8", "#0b1120"],
  unknown: ["#8b96ab", "#f2f6ff"],
};

export function typeColor(type: string): readonly [string, string] {
  return typeColors[type] ?? typeColors.unknown;
}

export function cap(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/-/g, " ")
    .toUpperCase();
}
