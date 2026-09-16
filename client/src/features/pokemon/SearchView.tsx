import { useState } from "react";
import { Hint } from "../../components/Hint";
import { Sprite } from "../../components/Sprite";
import { Input } from "../../components/ui/input";
import type { PokemonDTO } from "../../types/pokemon";
import type { GenerationSpeciesEntry } from "../../types/species";

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
      <div className="rounded-base border-[3px] border-ink bg-panel p-2 shadow-[3px_3px_0_var(--color-ink)]">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search species..."
          className="p-2.75 text-[16px]"
        />
      </div>
      <Hint>
        {!q
          ? "Type a species name to search the dex."
          : results.length
            ? `${results.length} species`
            : `No species found for "${query}".`}
      </Hint>
      {results.map((entry) => {
        const owned = [...party, ...pc].filter(
          (p) => p.pokeApiId === entry.pokeApiId,
        );
        const inParty = owned.filter((p) => p.location === "PARTY");
        const inPc = owned.filter((p) => p.location === "PC");
        let status = "NOT REGISTERED";
        let statusClass = "bg-highlight text-text-faint";
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
            className="mb-2 flex min-h-16.5 w-full items-center gap-2.5 rounded-base border-[3px] border-ink bg-panel p-2 text-left shadow-[3px_3px_0_var(--color-ink)]"
          >
            <div className="flex size-13.5 flex-none items-center justify-center rounded-base border-2 border-ink bg-frame">
              <Sprite
                url={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.pokeApiId}.png`}
                size={46}
                alt={entry.name}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.25">
              <div className="font-pix text-[8px] text-text">
                {entry.name.toUpperCase()}
              </div>
              <div className="font-vt text-[16px] text-text-muted">
                #{entry.pokeApiId}
                {owned.length
                  ? ` · ${owned.map((p) => `Lv ${p.level}`).join(", ")}`
                  : " · tap to register"}
              </div>
              <span
                className={`self-start rounded-base border-2 border-ink px-1.25 py-1 font-pix text-[8px] ${statusClass}`}
              >
                {status}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
