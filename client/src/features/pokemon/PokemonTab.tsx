import { useMemo, useState } from "react";
import { Btn, Hint, Sprite, TypeBadge } from "../../components";
import type { PokemonDTO } from "../../types/pokemon";
import type { GenerationSpeciesEntry } from "../../types/species";

function nameOf(p: PokemonDTO): string {
  return p.nickname ?? (p.species ? p.species.name.toUpperCase() : "UNKNOWN");
}

function PartyCell({ pokemon, slot, onClick }: { pokemon: PokemonDTO | undefined; slot: number; onClick: () => void }) {
  if (!pokemon) {
    return (
      <button
        onClick={onClick}
        className="flex min-h-33 flex-col gap-1.5 border-[3px] border-ink bg-slot-empty p-2 text-left shadow-[inset_0_3px_0_var(--color-border),3px_3px_0_var(--color-ink)]"
      >
        <div className="font-pix text-[8px] text-text-faint">SLOT {slot}</div>
        <div className="flex flex-1 items-center justify-center">
          <span className="font-pix text-[20px] text-text-dim">+</span>
        </div>
      </button>
    );
  }

  const types = pokemon.species?.types ?? [];
  return (
    <button
      onClick={onClick}
      className="flex min-h-33 flex-col gap-1.5 border-[3px] border-ink bg-panel p-2 text-left shadow-[inset_0_3px_0_#ffffff,3px_3px_0_var(--color-ink)]"
    >
      <div className="font-pix text-[8px] text-blue">SLOT {slot}</div>
      <div className="flex flex-1 items-center gap-[7px]">
        <div className="flex size-19 flex-none items-center justify-center border-2 border-ink bg-frame">
          <Sprite url={pokemon.species?.sprite} size={68} alt={nameOf(pokemon)} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <div className="font-pix text-[9px] leading-[1.4] break-words text-text">{nameOf(pokemon)}</div>
          <div className="font-vt text-[20px] leading-none text-text-muted">Lv {pokemon.level}</div>
          <div className="flex flex-col items-start gap-[3px]">
            {types.length ? types.map((t) => <TypeBadge key={t} type={t} />) : <TypeBadge type="unknown" />}
          </div>
        </div>
      </div>
    </button>
  );
}

export function PartyView({ party, onOpenDetail, onOpenAdd }: { party: PokemonDTO[]; onOpenDetail: (id: string) => void; onOpenAdd: () => void }) {
  const slots = Array.from({ length: 6 }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot) => {
        const found = party.find((p) => p.slotPosition === slot);
        return <PartyCell key={slot} pokemon={found} slot={slot} onClick={() => (found ? onOpenDetail(found.id) : onOpenAdd())} />;
      })}
    </div>
  );
}

function PcCell({ pokemon, onClick }: { pokemon: PokemonDTO; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-24 flex-col items-center justify-center gap-0.5 border-2 border-ink bg-panel p-1 shadow-[inset_0_2px_0_#ffffff]"
    >
      <div className="flex h-14 items-center justify-center">
        <Sprite url={pokemon.species?.sprite} size={48} alt={nameOf(pokemon)} />
      </div>
      <div className="max-w-full overflow-hidden font-vt text-[15px] leading-none text-ellipsis whitespace-nowrap text-text">
        {nameOf(pokemon)}
      </div>
      <div className="font-vt text-[14px] leading-none text-text-muted">Lv {pokemon.level}</div>
    </button>
  );
}

export function PcView({ pc, onOpenDetail, onOpenAdd }: { pc: PokemonDTO[]; onOpenDetail: (id: string) => void; onOpenAdd: () => void }) {
  const [filter, setFilter] = useState("");
  const types = useMemo(() => {
    const set = new Set<string>();
    pc.forEach((p) => p.species?.types.forEach((t) => set.add(t)));
    return [...set];
  }, [pc]);
  const shown = filter ? pc.filter((p) => p.species?.types.includes(filter)) : pc;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-[5px] overflow-x-auto pb-0.5">
        <button
          onClick={() => setFilter("")}
          className={`min-h-9 flex-none border-2 border-ink p-2 font-pix text-[7px] whitespace-nowrap ${
            filter === "" ? "bg-navy text-white" : "bg-panel-alt text-text-muted"
          }`}
        >
          ALL
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`min-h-9 flex-none border-2 border-ink p-2 font-pix text-[7px] whitespace-nowrap ${
              filter === t ? "bg-navy text-white" : "bg-panel-alt text-text-muted"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-[5px] border-[3px] border-ink bg-frame-alt p-1.5">
        {shown.length === 0 ? (
          <div className="col-span-full p-2.5 font-vt text-[18px] text-text-muted">
            {pc.length === 0 ? "No pokemon in the PC yet." : "No pokemon match this filter."}
          </div>
        ) : (
          shown.map((p) => <PcCell key={p.id} pokemon={p} onClick={() => onOpenDetail(p.id)} />)
        )}
      </div>
      <Btn variant="primary" full onClick={onOpenAdd}>
        + REGISTER POKEMON
      </Btn>
    </div>
  );
}

export function SearchView({
  dex,
  party,
  pc,
  onOpenDetail,
  onOpenAdd,
}: {
  dex: GenerationSpeciesEntry[];
  party: PokemonDTO[];
  pc: PokemonDTO[];
  onOpenDetail: (id: string) => void;
  onOpenAdd: (species: GenerationSpeciesEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = q ? dex.filter((e) => e.name.includes(q)).slice(0, 40) : [];

  return (
    <div className="flex flex-col gap-2">
      <div className="border-[3px] border-ink bg-panel p-2 shadow-[3px_3px_0_var(--color-ink)]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search species..."
          className="w-full border-2 border-ink bg-white p-[11px] text-[21px] text-ink"
        />
      </div>
      <Hint>{!q ? "Type a species name to search the dex." : results.length ? `${results.length} species` : `No species found for "${query}".`}</Hint>
      {results.map((entry) => {
        const owned = [...party, ...pc].filter((p) => p.pokeApiId === entry.pokeApiId);
        const inParty = owned.filter((p) => p.location === "PARTY");
        const inPc = owned.filter((p) => p.location === "PC");
        let status = "NOT REGISTERED";
        let statusClass = "bg-border text-text-faint";
        if (inParty.length) {
          status = `IN PARTY · SLOT ${inParty.map((p) => p.slotPosition ?? "-").join(",")}`;
          statusClass = "bg-navy text-white";
        } else if (inPc.length) {
          status = `IN PC (${inPc.length})`;
          statusClass = "bg-blue-soft text-ink";
        }
        const first = owned[0];
        return (
          <button
            key={entry.pokeApiId}
            onClick={() => (first ? onOpenDetail(first.id) : onOpenAdd(entry))}
            className="mb-2 flex min-h-[66px] w-full items-center gap-2.5 border-[3px] border-ink bg-panel p-2 text-left shadow-[3px_3px_0_var(--color-ink)]"
          >
            <div className="flex size-[54px] flex-none items-center justify-center border-2 border-ink bg-frame">
              <Sprite
                url={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.pokeApiId}.png`}
                size={46}
                alt={entry.name}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <div className="font-pix text-[8px] text-text">{entry.name.toUpperCase()}</div>
              <div className="font-vt text-[16px] text-text-muted">
                #{entry.pokeApiId}
                {owned.length ? ` · ${owned.map((p) => `Lv ${p.level}`).join(", ")}` : " · tap to register"}
              </div>
              <span className={`self-start border-2 border-ink px-[5px] py-1 font-pix text-[6px] ${statusClass}`}>
                {status}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
