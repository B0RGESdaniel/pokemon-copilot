import { tv } from "tailwind-variants";

const typeBadge = tv({
  base: "font-pix border-2 border-ink px-[5px] py-1",
  variants: {
    size: {
      6: "text-[6px]",
      7: "text-[7px]",
      8: "text-[8px]",
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

export function TypeBadge({ type, size }: { type: string; size?: 6 | 7 | 8 }) {
  return (
    <span className={typeBadge({ size, className: typeClass[type] ?? typeClass.unknown })}>
      {type === "unknown" ? "???" : type.toUpperCase()}
    </span>
  );
}

const spriteSizeClass: Record<number, string> = {
  44: "h-11 w-11",
  46: "h-[46px] w-[46px]",
  48: "h-12 w-12",
  64: "h-16 w-16",
  68: "h-17 w-17",
  120: "h-30 w-30",
  132: "h-33 w-33",
};

export function Sprite({ url, size, alt }: { url: string | null | undefined; size: number; alt?: string }) {
  const knownSize = spriteSizeClass[size];
  if (url) {
    return (
      <img
        src={url}
        alt={alt ?? "sprite"}
        className={`object-contain ${knownSize ?? ""}`}
        style={knownSize ? undefined : { width: size, height: size }}
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="font-pix text-text-faint" style={{ fontSize: Math.max(12, Math.round(size / 3.5)) }}>
        ?
      </div>
      {size > 90 ? <div className="font-vt text-[15px] text-text-faint">NO DATA</div> : null}
    </div>
  );
}
