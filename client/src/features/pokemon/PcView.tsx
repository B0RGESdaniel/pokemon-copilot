import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Sprite } from "../../components/Sprite";
import type { PokemonDTO } from "../../types/pokemon";

function nameOf(p: PokemonDTO): string {
  return p.nickname ?? (p.species ? p.species.name.toUpperCase() : "UNKNOWN");
}

function PcCell({
  pokemon,
  onClick,
}: {
  pokemon: PokemonDTO;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-24 flex-col items-center justify-center gap-0.5 border-2 border-ink bg-panel p-1 shadow-[inset_0_2px_0_#ffffff]"
    >
      <div className="flex h-14 items-center justify-center gap">
        <Sprite url={pokemon.species?.sprite} size={48} alt={nameOf(pokemon)} />
      </div>
      <div className="max-w-full overflow-hidden font-pix text-[8px] leading-none text-ellipsis whitespace-nowrap text-text mb-0.5">
        {nameOf(pokemon)}
      </div>
      <div className="font-pix text-[8px] leading-none text-text-muted">
        Lv {pokemon.level}
      </div>
    </button>
  );
}

export function PcView({
  pc,
  onOpenDetail,
  onOpenAdd,
}: {
  pc: PokemonDTO[];
  onOpenDetail: (id: string) => void;
  onOpenAdd: () => void;
}) {
  const [filter, setFilter] = useState("");
  const types = useMemo(() => {
    const set = new Set<string>();
    pc.forEach((p) => p.species?.types.forEach((t) => set.add(t)));
    return [...set];
  }, [pc]);
  const shown = filter
    ? pc.filter((p) => p.species?.types.includes(filter))
    : pc;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.25 overflow-x-auto pb-0.5">
        <button
          onClick={() => setFilter("")}
          className={`min-h-9 flex-none border-2 border-ink p-2 font-pix text-[8px] whitespace-nowrap ${
            filter === ""
              ? "bg-navy text-white"
              : "bg-panel-alt text-text-muted"
          }`}
        >
          ALL
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`min-h-9 flex-none border-2 border-ink p-2 font-pix text-[8px] whitespace-nowrap ${
              filter === t
                ? "bg-navy text-white"
                : "bg-panel-alt text-text-muted"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.25 border-[3px] border-ink bg-frame-alt p-1.5">
        {shown.length === 0 ? (
          <div className="col-span-full p-2.5 font-vt text-[16px] text-text-muted">
            {pc.length === 0
              ? "No pokemon in the PC yet."
              : "No pokemon match this filter."}
          </div>
        ) : (
          shown.map((p) => (
            <PcCell key={p.id} pokemon={p} onClick={() => onOpenDetail(p.id)} />
          ))
        )}
      </div>
      <Button variant="primary" full onClick={onOpenAdd}>
        + REGISTER POKEMON
      </Button>
    </div>
  );
}
