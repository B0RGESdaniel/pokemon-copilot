import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

// Same retro border/shadow language as components/ui/button.tsx (border-[3px]
// + inset top highlight + a hard drop shadow, with the shadow dropped on
// press), but the drop shadow is cast straight down (`0_3px_0`) instead of
// Button's diagonal `3px_3px_0` — reads better for a row of side-by-side
// tabs sitting at the very bottom of the screen. Press feedback matches too:
// translate-y only (no x), since there's no horizontal shadow to close.
const tabClass =
  "min-h-14 flex-1 rounded-base border-[3px] border-ink bg-navy-dark font-pix text-[16px] text-nav-inactive shadow-[inset_0_3px_0_var(--color-navy-light),0_3px_0_var(--color-ink)] transition-[transform,box-shadow] duration-500 active:translate-y-boxShadowY active:shadow-none data-active:bg-blue data-active:text-white data-active:shadow-[inset_0_3px_0_var(--color-blue-light),0_3px_0_var(--color-ink)] data-active:[text-shadow:2px_2px_0_var(--color-ink)]";

export function BottomNav({
  tab,
  onChange,
}: {
  tab: "pokemons" | "battle";
  onChange: (t: "pokemons" | "battle") => void;
}) {
  return (
    <div className="flex-none border-t-[3px] border-ink bg-navy-dark p-2">
      <Tabs
        value={tab}
        onValueChange={(v) => onChange(v as "pokemons" | "battle")}
      >
        <TabsList className="gap-2">
          <TabsTrigger value="pokemons" className={tabClass}>
            POKEMONS
          </TabsTrigger>
          <TabsTrigger value="battle" className={tabClass}>
            BATTLE
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
