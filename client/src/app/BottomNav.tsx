import { tv } from "tailwind-variants";

const bottomNavItem = tv({
  base: "flex min-h-16 flex-1 flex-row items-center justify-center gap-2.5 border-0 font-pix text-[16px]",
  variants: {
    active: {
      true: "bg-blue text-white",
      false: "bg-navy-dark text-nav-inactive",
    },
  },
});

export function BottomNav({
  tab,
  onChange,
}: {
  tab: "pokemons" | "battle";
  onChange: (t: "pokemons" | "battle") => void;
}) {
  const isPokemons = tab === "pokemons";
  return (
    <div className="flex flex-none border-t-[3px] border-ink bg-navy-dark">
      <button
        onClick={() => onChange("pokemons")}
        className={bottomNavItem({
          active: isPokemons,
          className: "border-r-[3px] border-ink",
        })}
      >
        POKEMONS
      </button>
      <button
        onClick={() => onChange("battle")}
        className={bottomNavItem({ active: !isPokemons })}
      >
        BATTLE
      </button>
    </div>
  );
}
