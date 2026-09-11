import { tv } from "tailwind-variants";

const bottomNavItem = tv({
  slots: {
    button:
      "flex min-h-16 flex-1 flex-col items-center justify-center gap-1.5 border-0 font-pix text-[8px]",
    dot: "size-3 border-2 border-ink",
  },
  variants: {
    active: {
      true: { button: "bg-blue text-white", dot: "bg-white" },
      false: {
        button: "bg-navy-dark text-nav-inactive",
        dot: "bg-nav-inactive",
      },
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
  const pokemonNav = bottomNavItem({ active: isPokemons });
  const battleNav = bottomNavItem({ active: !isPokemons });
  return (
    <div className="flex flex-none border-t-[3px] border-ink bg-navy-dark">
      <button
        onClick={() => onChange("pokemons")}
        className={pokemonNav.button({
          className: "border-r-[3px] border-ink",
        })}
      >
        <span className={pokemonNav.dot()} />
        POKEMON
      </button>
      <button onClick={() => onChange("battle")} className={battleNav.button()}>
        <span className={battleNav.dot()} />
        BATTLE
      </button>
    </div>
  );
}
