import { useState } from "react";
import { tv } from "tailwind-variants";
import { Btn, SearchInput, SectionLabel, Stepper } from "../components";
import type { Save } from "../types/saves";

export function Header({
  headerMeta,
  saves,
  selectedSave,
  onSelectSave,
  onCreateSave,
}: {
  headerMeta: string;
  saves: Save[];
  selectedSave: Save;
  onSelectSave: (id: string) => void;
  onCreateSave: (input: { name: string; game: string; generation: number }) => Promise<Save>;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  return (
    <div className="relative flex-none">
      <div className="flex items-center gap-2.5 border-b-[3px] border-ink bg-navy px-3 pt-3 pb-2.5 shadow-[inset_0_-4px_0_var(--color-navy-dark)]">
        <img src="/pokeball.png" alt="Pokemon Copilot" className="size-[26px] shrink-0 object-contain" />
        <div className="font-pix text-[10px] tracking-[1px] text-white [text-shadow:2px_2px_0_var(--color-ink)]">
          POKEMON COPILOT
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto border-0 bg-transparent font-vt text-[17px] text-header-hint"
        >
          {headerMeta} ▾
        </button>
      </div>

      {open ? (
        <div className="absolute top-full right-2 z-10 flex w-[260px] flex-col gap-1.5 border-[3px] border-ink bg-panel p-2.5 shadow-[3px_3px_0_var(--color-ink)]">
          <SectionLabel>SAVES</SectionLabel>
          {saves.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectSave(s.id);
                setOpen(false);
              }}
              className={`border-2 border-ink p-2 text-left font-pix text-[8px] ${
                s.id === selectedSave.id ? "bg-navy text-white" : "bg-panel-alt text-text"
              }`}
            >
              {s.name.toUpperCase()} · GEN {s.generation}
            </button>
          ))}
          {creating ? (
            <NewSaveInline
              onCancel={() => setCreating(false)}
              onCreate={async (input) => {
                await onCreateSave(input);
                setCreating(false);
                setOpen(false);
              }}
            />
          ) : (
            <Btn variant="primary" full onClick={() => setCreating(true)} fontSize={8} minHeight={40}>
              + NEW SAVE
            </Btn>
          )}
        </div>
      ) : null}
    </div>
  );
}

function NewSaveInline({
  onCreate,
  onCancel,
}: {
  onCreate: (input: { name: string; game: string; generation: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [generation, setGeneration] = useState(4);
  return (
    <div className="flex flex-col gap-1.5 border-t-2 border-frame-alt pt-1.5">
      <SearchInput value={name} onChange={setName} placeholder="save name" />
      <SearchInput value={game} onChange={setGame} placeholder="game (ex: platinum)" />
      <Stepper value={generation} onChange={setGeneration} min={1} max={9} />
      <div className="flex gap-1.5">
        <Btn variant="ghost" full fontSize={7} minHeight={36} onClick={onCancel}>
          CANCEL
        </Btn>
        <Btn
          variant="primary"
          full
          fontSize={7}
          minHeight={36}
          onClick={() => void onCreate({ name, game: game.toLowerCase(), generation })}
        >
          CREATE
        </Btn>
      </div>
    </div>
  );
}

const subnavTab = tv({
  base: "min-h-11 flex-1 border-2 border-ink font-pix text-[8px]",
  variants: {
    active: {
      true: "bg-navy text-white shadow-[inset_0_2px_0_var(--color-navy-light)]",
      false: "bg-[#b8c1d2] text-[#7a8598] shadow-[inset_0_2px_0_#c7cfdd]",
    },
  },
});

export function Subnav({ sub, onChange }: { sub: "party" | "pc" | "search"; onChange: (s: "party" | "pc" | "search") => void }) {
  const tabs: { key: "party" | "pc" | "search"; label: string }[] = [
    { key: "party", label: "PARTY" },
    { key: "pc", label: "PC" },
    { key: "search", label: "SEARCH" },
  ];
  return (
    <div className="flex flex-none gap-1.5 border-b-[3px] border-ink bg-bg-alt p-2">
      {tabs.map((t) => {
        const active = sub === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={subnavTab({ active })}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

const bottomNavItem = tv({
  slots: {
    button: "flex min-h-16 flex-1 flex-col items-center justify-center gap-1.5 border-0 font-pix text-[9px]",
    dot: "size-3 border-2 border-ink",
  },
  variants: {
    active: {
      true: { button: "bg-blue text-white", dot: "bg-white" },
      false: { button: "bg-navy-dark text-nav-inactive", dot: "bg-nav-inactive" },
    },
  },
});

export function BottomNav({ tab, onChange }: { tab: "pokemons" | "battle"; onChange: (t: "pokemons" | "battle") => void }) {
  const isPokemons = tab === "pokemons";
  const pokemonNav = bottomNavItem({ active: isPokemons });
  const battleNav = bottomNavItem({ active: !isPokemons });
  return (
    <div className="flex flex-none border-t-[3px] border-ink bg-navy-dark">
      <button onClick={() => onChange("pokemons")} className={pokemonNav.button({ className: "border-r-[3px] border-ink" })}>
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
