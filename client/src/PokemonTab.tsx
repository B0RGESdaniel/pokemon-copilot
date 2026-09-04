import { useMemo, useState } from "react";
import { colors, PIX, VT } from "./theme";
import { Btn, Hint, Sprite, TypeBadge } from "./ui";
import type { GenerationSpeciesEntry, PokemonDTO } from "./types";

function nameOf(p: PokemonDTO): string {
  return p.nickname ?? (p.species ? p.species.name.toUpperCase() : "UNKNOWN");
}

function PartyCell({ pokemon, slot, onClick }: { pokemon: PokemonDTO | undefined; slot: number; onClick: () => void }) {
  if (!pokemon) {
    return (
      <button
        onClick={onClick}
        style={{
          minHeight: 132,
          padding: 8,
          border: `3px solid ${colors.ink}`,
          background: colors.slotEmpty,
          boxShadow: `inset 0 3px 0 ${colors.border}, 3px 3px 0 ${colors.ink}`,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          textAlign: "left",
        }}
      >
        <div style={{ ...PIX, fontSize: 8, color: colors.textFaint }}>SLOT {slot}</div>
        <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...PIX, fontSize: 20, color: colors.textDim }}>+</span>
        </div>
      </button>
    );
  }

  const types = pokemon.species?.types ?? [];
  return (
    <button
      onClick={onClick}
      style={{
        minHeight: 132,
        padding: 8,
        border: `3px solid ${colors.ink}`,
        background: colors.panel,
        boxShadow: `inset 0 3px 0 #ffffff, 3px 3px 0 ${colors.ink}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        textAlign: "left",
      }}
    >
      <div style={{ ...PIX, fontSize: 8, color: colors.blue }}>SLOT {slot}</div>
      <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 76, height: 76, flex: "0 0 76px", background: colors.frame, border: `2px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sprite url={pokemon.species?.sprite} size={68} alt={nameOf(pokemon)} />
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ ...PIX, fontSize: 9, color: colors.text, lineHeight: 1.4, wordBreak: "break-word" }}>{nameOf(pokemon)}</div>
          <div style={{ ...VT, fontSize: 20, lineHeight: 1, color: colors.textMuted }}>Lv {pokemon.level}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
      style={{
        minHeight: 96,
        padding: 4,
        border: `2px solid ${colors.ink}`,
        background: colors.panel,
        boxShadow: "inset 0 2px 0 #ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sprite url={pokemon.species?.sprite} size={48} alt={nameOf(pokemon)} />
      </div>
      <div style={{ ...VT, fontSize: 15, lineHeight: 1, color: colors.text, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {nameOf(pokemon)}
      </div>
      <div style={{ ...VT, fontSize: 14, lineHeight: 1, color: colors.textMuted }}>Lv {pokemon.level}</div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 }}>
        <button
          onClick={() => setFilter("")}
          style={{ flex: "0 0 auto", whiteSpace: "nowrap", fontSize: 7, fontFamily: "'Press Start 2P', monospace", padding: 8, border: `2px solid ${colors.ink}`, minHeight: 36, background: filter === "" ? colors.navy : colors.panelAlt, color: filter === "" ? colors.white : colors.textMuted }}
        >
          ALL
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{ flex: "0 0 auto", whiteSpace: "nowrap", fontSize: 7, fontFamily: "'Press Start 2P', monospace", padding: 8, border: `2px solid ${colors.ink}`, minHeight: 36, background: filter === t ? colors.navy : colors.panelAlt, color: filter === t ? colors.white : colors.textMuted }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ border: `3px solid ${colors.ink}`, background: colors.frameAlt, padding: 6, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
        {shown.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", ...VT, fontSize: 18, color: colors.textMuted, padding: 10 }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ border: `3px solid ${colors.ink}`, background: colors.panel, boxShadow: `3px 3px 0 ${colors.ink}`, padding: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search species..."
          style={{ width: "100%", fontSize: 21, padding: 11, border: `2px solid ${colors.ink}`, background: "#fff", color: colors.ink }}
        />
      </div>
      <Hint>{!q ? "Type a species name to search the dex." : results.length ? `${results.length} species` : `No species found for "${query}".`}</Hint>
      {results.map((entry) => {
        const owned = [...party, ...pc].filter((p) => p.pokeApiId === entry.pokeApiId);
        const inParty = owned.filter((p) => p.location === "PARTY");
        const inPc = owned.filter((p) => p.location === "PC");
        let status = "NOT REGISTERED";
        let statusBg: string = colors.border;
        let statusFg: string = colors.textFaint;
        if (inParty.length) {
          status = `IN PARTY · SLOT ${inParty.map((p) => p.slotPosition ?? "-").join(",")}`;
          statusBg = colors.navy;
          statusFg = colors.white;
        } else if (inPc.length) {
          status = `IN PC (${inPc.length})`;
          statusBg = colors.blueSoft;
          statusFg = colors.ink;
        }
        const first = owned[0];
        return (
          <button
            key={entry.pokeApiId}
            onClick={() => (first ? onOpenDetail(first.id) : onOpenAdd(entry))}
            style={{ width: "100%", border: `3px solid ${colors.ink}`, background: colors.panel, boxShadow: `3px 3px 0 ${colors.ink}`, padding: 8, display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 66, marginBottom: 8 }}
          >
            <div style={{ width: 54, height: 54, flex: "0 0 54px", background: colors.frame, border: `2px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sprite url={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.pokeApiId}.png`} size={46} alt={entry.name} />
            </div>
            <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ ...PIX, fontSize: 8, color: colors.text }}>{entry.name.toUpperCase()}</div>
              <div style={{ ...VT, fontSize: 16, color: colors.textMuted }}>
                #{entry.pokeApiId}
                {owned.length ? ` · ${owned.map((p) => `Lv ${p.level}`).join(", ")}` : " · tap to register"}
              </div>
              <span style={{ ...PIX, fontSize: 6, padding: "4px 5px", border: `2px solid ${colors.ink}`, background: statusBg, color: statusFg, alignSelf: "flex-start" }}>
                {status}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
