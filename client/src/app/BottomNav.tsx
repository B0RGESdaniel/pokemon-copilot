import { tv } from "tailwind-variants";
import { TabIcon } from "../components/TabIcon";

const bottomNavItem = tv({
  slots: {
    button:
      "flex min-h-16 flex-1 flex-row items-center justify-center gap-2.5 border-0 font-pix text-[8px]",
    icon: "size-6",
  },
  variants: {
    active: {
      true: { button: "bg-blue text-white", icon: "bg-white" },
      false: {
        button: "bg-navy-dark text-nav-inactive",
        icon: "bg-nav-inactive",
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
        <TabIcon src="/pokeball-icon.svg" className={pokemonNav.icon()} />
        POKEMONS
      </button>
      <button onClick={() => onChange("battle")} className={battleNav.button()}>
        <TabIcon src="/battle-icon.svg" className={battleNav.icon()} />
        BATTLE
      </button>
    </div>
  );
}
