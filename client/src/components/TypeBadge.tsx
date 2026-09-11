import { tv } from "tailwind-variants";

const typeBadge = tv({
  base: "font-pix border-2 border-ink px-1.25 py-1",
  variants: {
    size: {
      6: "text-[6px]",
      7: "text-[7px]",
      8: "text-[8px]",
      16: "text-[16px]",
    },
  },
  defaultVariants: {
    size: 7,
  },
});

const typeClass: Record<string, string> = {
  fire: "bg-type-fire text-type-fire-fg",
  water: "bg-type-water text-type-water-fg",
  grass: "bg-type-grass text-type-grass-fg",
  electric: "bg-type-electric text-type-electric-fg",
  normal: "bg-type-normal text-type-normal-fg",
  flying: "bg-type-flying text-type-flying-fg",
  poison: "bg-type-poison text-type-poison-fg",
  ghost: "bg-type-ghost text-type-ghost-fg",
  fighting: "bg-type-fighting text-type-fighting-fg",
  psychic: "bg-type-psychic text-type-psychic-fg",
  dark: "bg-type-dark text-type-dark-fg",
  steel: "bg-type-steel text-type-steel-fg",
  ground: "bg-type-ground text-type-ground-fg",
  ice: "bg-type-ice text-type-ice-fg",
  dragon: "bg-type-dragon text-type-dragon-fg",
  rock: "bg-type-rock text-type-rock-fg",
  bug: "bg-type-bug text-type-bug-fg",
  fairy: "bg-type-fairy text-type-fairy-fg",
  stellar: "bg-type-stellar text-type-stellar-fg",
  unknown: "bg-type-unknown text-type-unknown-fg",
};

export function TypeBadge({
  type,
  size,
}: {
  type: string;
  size?: 6 | 7 | 8 | 16;
}) {
  return (
    <span
      className={typeBadge({
        size,
        className: typeClass[type] ?? typeClass.unknown,
      })}
    >
      {type === "unknown" ? "???" : type.toUpperCase()}
    </span>
  );
}
