import { useEffect, useState } from "react";
import { deletePokemon, getEvolutions, getLegalMoves, learnMove, movePokemon, searchItems, updatePokemon } from "../api";
import { colors, PIX, VT, cap } from "../theme";
import { Btn, ConfirmBar, Hint, PageShell, Panel, SearchInput, SectionLabel, Sprite, Stepper, TypeBadge } from "../ui";
import type { EvolutionOption, LearnMoveResult, PokemonDTO } from "../types";

const STAT_DEFS: { key: string; label: string; color: string }[] = [
  { key: "hp", label: "HP", color: "#c03830" },
  { key: "attack", label: "ATTACK", color: "#e2762f" },
  { key: "defense", label: "DEFENSE", color: "#3a6ec0" },
  { key: "specialAttack", label: "SP. ATK", color: "#8e3c96" },
  { key: "specialDefense", label: "SP. DEF", color: "#5aa943" },
  { key: "speed", label: "SPEED", color: "#e6c422" },
];

function nameOf(p: PokemonDTO): string {
  return p.nickname ?? (p.species ? p.species.name.toUpperCase() : "UNKNOWN");
}

export function DetailFlow({
  saveId,
  pokemon,
  onBack,
  onFlash,
  onMutated,
}: {
  saveId: string;
  pokemon: PokemonDTO;
  onBack: () => void;
  onFlash: (msg: string) => void;
  onMutated: () => Promise<void>;
}) {
  const [page, setPage] = useState<"detail" | "moves" | "item" | "evolve">("detail");
  const [confirming, setConfirming] = useState(false);
  const [evoInfo, setEvoInfo] = useState(false);
  const [evolutions, setEvolutions] = useState<EvolutionOption[]>([]);

  useEffect(() => {
    getEvolutions(pokemon.pokeApiId)
      .then(setEvolutions)
      .catch(() => setEvolutions([]));
  }, [pokemon.pokeApiId]);

  if (page === "moves") {
    return (
      <MovesPage
        saveId={saveId}
        pokemon={pokemon}
        onBack={() => setPage("detail")}
        onFlash={onFlash}
        onMutated={onMutated}
      />
    );
  }
  if (page === "item") {
    return <ItemPage pokemon={pokemon} onBack={() => setPage("detail")} onFlash={onFlash} onMutated={onMutated} />;
  }
  if (page === "evolve") {
    return (
      <EvolvePage
        pokemon={pokemon}
        evolutions={evolutions}
        onBack={() => setPage("detail")}
        onFlash={onFlash}
        onMutated={onMutated}
      />
    );
  }

  const sp = pokemon.species;

  const setLevel = async (level: number) => {
    await updatePokemon(pokemon.id, { level });
    await onMutated();
  };

  const toggleLocation = async () => {
    try {
      await movePokemon(pokemon.id, pokemon.location === "PARTY" ? "PC" : "PARTY");
      onFlash(pokemon.location === "PARTY" ? "Moved to the PC." : "Moved to the party.");
      await onMutated();
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to move pokemon.");
    }
  };

  const confirmDelete = async () => {
    await deletePokemon(pokemon.id);
    onFlash(`${nameOf(pokemon)} was released.`);
    await onMutated();
    onBack();
  };

  return (
    <PageShell title={`${nameOf(pokemon)} · ${pokemon.location === "PARTY" ? `PARTY ${pokemon.slotPosition ?? "-"}` : "PC"}`} onBack={onBack}>
      <Panel style={{ alignItems: "center" }}>
        <div style={{ width: 132, height: 132, background: colors.frame, border: `3px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sprite url={sp?.sprite} size={120} alt={nameOf(pokemon)} />
        </div>
        <div style={{ ...PIX, fontSize: 12, color: colors.text, textAlign: "center" }}>{nameOf(pokemon)}</div>
        <Hint>{sp ? `#${pokemon.pokeApiId} · ${cap(sp.name)}` : "POKEAPI DATA UNAVAILABLE"}</Hint>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {(sp?.types ?? ["unknown"]).map((t) => (
            <TypeBadge key={t} type={t} size={8} />
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionLabel>LEVEL</SectionLabel>
        <Stepper value={pokemon.level} onChange={(v) => void setLevel(v)} />
      </Panel>

      <Panel>
        <SectionLabel>BASE STATS</SectionLabel>
        {sp
          ? STAT_DEFS.map((st) => {
              const value = sp.baseStats[st.key as keyof typeof sp.baseStats];
              const pct = Math.min(100, Math.round((value / 140) * 100));
              return (
                <div key={st.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 62, flex: "0 0 62px", ...PIX, fontSize: 7, color: colors.textMuted }}>{st.label}</div>
                  <div style={{ flex: "1 1 auto", height: 18, border: `2px solid ${colors.ink}`, background: colors.frame, padding: 2 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: st.color }} />
                  </div>
                  <div style={{ width: 32, flex: "0 0 32px", textAlign: "right", ...PIX, fontSize: 8, color: colors.text }}>{value}</div>
                </div>
              );
            })
          : <Hint>Stats unavailable without species data.</Hint>}
      </Panel>

      <Panel>
        <SectionLabel>MOVES ({pokemon.moves.length}/4)</SectionLabel>
        {pokemon.moves.length === 0 ? (
          <Hint>No moves registered.</Hint>
        ) : (
          pokemon.moves.map((m) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${colors.ink}`, background: colors.panelAlt, padding: 10, minHeight: 46 }}>
              <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(m)}</span>
            </div>
          ))
        )}
        <Btn variant="primary" full onClick={() => setPage("moves")}>
          CHANGE MOVES
        </Btn>
      </Panel>

      <Panel>
        <SectionLabel>HELD ITEM</SectionLabel>
        <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, padding: 10, minHeight: 46, display: "flex", alignItems: "center", ...VT, fontSize: 19, color: colors.text }}>
          {pokemon.heldItem ? cap(pokemon.heldItem) : "NONE"}
        </div>
        <Btn variant="secondary" full onClick={() => setPage("item")}>
          {pokemon.heldItem ? "CHANGE / REMOVE ITEM" : "GIVE AN ITEM"}
        </Btn>
      </Panel>

      <Panel>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn
            variant={evolutions.length ? "secondary" : "ghost"}
            style={{ flex: "1 1 auto", background: evolutions.length ? colors.yellow : colors.bgAlt }}
            onClick={() => (evolutions.length ? setPage("evolve") : onFlash(`${nameOf(pokemon)} has no known evolution.`))}
          >
            {evolutions.length ? "EVOLVE" : "NO EVOLUTION"}
          </Btn>
          <Btn variant={evoInfo ? "primary" : "ghost"} style={{ width: 56, flex: "0 0 56px" }} onClick={() => setEvoInfo((v) => !v)} fontSize={12}>
            i
          </Btn>
        </div>
        {evoInfo ? (
          <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ ...PIX, fontSize: 7, color: colors.textMuted }}>EVOLUTION METHOD</div>
            {evolutions.length === 0 ? (
              <div style={{ ...VT, fontSize: 18, color: colors.text }}>{sp ? `${cap(sp.name)} is in its final form.` : "No species data."}</div>
            ) : (
              evolutions.map((e) => (
                <div key={e.pokeApiId} style={{ ...VT, fontSize: 18, color: colors.text }}>
                  {cap(e.name)} — {e.method}
                </div>
              ))
            )}
          </div>
        ) : null}
      </Panel>

      <Btn variant="secondary" full onClick={() => void toggleLocation()} style={{ background: colors.navy, color: colors.white, boxShadow: `inset 0 3px 0 ${colors.navyLight}, 3px 3px 0 ${colors.ink}`, textShadow: `1px 1px 0 ${colors.ink}` }}>
        {pokemon.location === "PARTY" ? "MOVE TO PC" : "MOVE TO PARTY"}
      </Btn>

      {!confirming ? (
        <Btn variant="outlineDanger" full onClick={() => setConfirming(true)}>
          DELETE
        </Btn>
      ) : (
        <ConfirmBar
          danger
          text={`Delete ${nameOf(pokemon)} forever? This cannot be undone.`}
          confirmLabel="YES, DELETE"
          onCancel={() => setConfirming(false)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </PageShell>
  );
}

function MovesPage({
  saveId,
  pokemon,
  onBack,
  onFlash,
  onMutated,
}: {
  saveId: string;
  pokemon: PokemonDTO;
  onBack: () => void;
  onFlash: (msg: string) => void;
  onMutated: () => Promise<void>;
}) {
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<LearnMoveResult | null>(null);

  useEffect(() => {
    getLegalMoves(saveId, pokemon.pokeApiId).then(setLegalMoves);
  }, [saveId, pokemon.pokeApiId]);

  const removeMove = async (move: string) => {
    await updatePokemon(pokemon.id, { moves: pokemon.moves.filter((m) => m !== move) });
    onFlash(`${cap(move)} removed.`);
    await onMutated();
  };

  const addMove = async (move: string) => {
    setSuggestion(null);
    try {
      const result = await learnMove(pokemon.id, move);
      if (result.outcome === "learned_directly") {
        onFlash(`${cap(move)} learned.`);
        await onMutated();
      } else {
        setSuggestion(result);
      }
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to learn move.");
    }
  };

  const applyReplacement = async (replace: string, move: string) => {
    await updatePokemon(pokemon.id, { moves: pokemon.moves.map((m) => (m === replace ? move : m)) });
    setSuggestion(null);
    onFlash(`${cap(move)} learned, replacing ${cap(replace)}.`);
    await onMutated();
  };

  const learnable = legalMoves.filter((m) => !pokemon.moves.includes(m));

  return (
    <PageShell title="CHANGE MOVES" onBack={onBack}>
      <Panel>
        <SectionLabel>CURRENT MOVES ({pokemon.moves.length}/4)</SectionLabel>
        {pokemon.moves.length === 0 ? (
          <Hint>No moves. Pick some below.</Hint>
        ) : (
          pokemon.moves.map((m) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${colors.ink}`, background: colors.panelAlt, padding: 10, minHeight: 46 }}>
              <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(m)}</span>
              <Btn variant="danger" onClick={() => void removeMove(m)} minHeight={40} style={{ width: 40, height: 40, padding: 0 }} fontSize={9}>
                X
              </Btn>
            </div>
          ))
        )}
      </Panel>

      {suggestion?.outcome === "suggested_replacement" ? (
        <Panel style={{ border: `3px solid ${colors.yellow}`, background: colors.yellowSoft }}>
          <SectionLabel>ALREADY HAS 4 MOVES</SectionLabel>
          <Hint>Suggestion: replace {cap(suggestion.suggestedReplacement)} (weakest). Tap the move that should go.</Hint>
          {suggestion.comparisons.map((c) => (
            <button
              key={c.moveB.move}
              onClick={() => void applyReplacement(c.moveB.move, suggestion.newMove.move)}
              style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${colors.ink}`, background: c.moveB.move === suggestion.suggestedReplacement ? colors.yellowSoft : colors.panel, padding: 10, minHeight: 52, textAlign: "left" }}
            >
              <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(c.moveB.move)}</span>
              <span style={{ ...VT, fontSize: 15, color: colors.textMuted }}>score {c.moveB.score}</span>
            </button>
          ))}
        </Panel>
      ) : null}

      <Panel>
        <SectionLabel>LEARNABLE</SectionLabel>
        {learnable.length === 0 ? <Hint>No more legal moves to learn for this game.</Hint> : null}
        {learnable.map((m) => (
          <button
            key={m}
            onClick={() => void addMove(m)}
            style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${colors.ink}`, background: colors.panel, padding: 10, minHeight: 48, textAlign: "left" }}
          >
            <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(m)}</span>
          </button>
        ))}
      </Panel>
    </PageShell>
  );
}

function ItemPage({
  pokemon,
  onBack,
  onFlash,
  onMutated,
}: {
  pokemon: PokemonDTO;
  onBack: () => void;
  onFlash: (msg: string) => void;
  onMutated: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [choices, setChoices] = useState<string[]>([]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setChoices([]);
      return;
    }
    let cancelled = false;
    searchItems(q).then((list) => !cancelled && setChoices(list));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const pick = async (item: string) => {
    await updatePokemon(pokemon.id, { heldItem: item });
    onFlash(`${cap(item)} equipped.`);
    await onMutated();
    onBack();
  };

  const remove = async () => {
    await updatePokemon(pokemon.id, { heldItem: null });
    onFlash("Item removed.");
    await onMutated();
  };

  return (
    <PageShell title="HELD ITEM" onBack={onBack}>
      <Panel>
        <SectionLabel>CURRENT ITEM</SectionLabel>
        <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, padding: 10, minHeight: 46, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: "1 1 auto", ...VT, fontSize: 19, color: colors.text }}>{pokemon.heldItem ? cap(pokemon.heldItem) : "NONE"}</span>
          {pokemon.heldItem ? (
            <Btn variant="danger" onClick={() => void remove()} minHeight={40} fontSize={8}>
              REMOVE
            </Btn>
          ) : null}
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="search item..." />
        {choices.length > 0 ? (
          <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, maxHeight: 230, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {choices.map((it) => (
              <button
                key={it}
                onClick={() => void pick(it)}
                style={{ display: "flex", alignItems: "center", padding: 10, minHeight: 46, background: pokemon.heldItem === it ? colors.yellow : colors.panel, border: "none", borderBottom: `2px solid ${colors.frameAlt}`, textAlign: "left", fontSize: 8, color: colors.text, fontFamily: "'Press Start 2P', monospace" }}
              >
                {cap(it)}
              </button>
            ))}
          </div>
        ) : !query.trim() ? (
          <Hint>Type to search for an item.</Hint>
        ) : null}
      </Panel>
    </PageShell>
  );
}

function EvolvePage({
  pokemon,
  evolutions,
  onBack,
  onFlash,
  onMutated,
}: {
  pokemon: PokemonDTO;
  evolutions: EvolutionOption[];
  onBack: () => void;
  onFlash: (msg: string) => void;
  onMutated: () => Promise<void>;
}) {
  const pick = async (option: EvolutionOption) => {
    try {
      await updatePokemon(pokemon.id, { pokeApiId: option.pokeApiId });
      onFlash(`${cap(pokemon.species?.name)} evolved into ${cap(option.name)}!`);
      await onMutated();
      onBack();
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to evolve.");
    }
  };

  return (
    <PageShell title="EVOLVE" onBack={onBack}>
      <Panel>
        <SectionLabel>POSSIBLE EVOLUTIONS</SectionLabel>
        <Hint>{evolutions.length > 1 ? "This species has several paths. Pick one." : "Tap a card to confirm the evolution."}</Hint>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {evolutions.map((o) => (
            <button
              key={o.pokeApiId}
              onClick={() => void pick(o)}
              style={{ border: `3px solid ${colors.ink}`, background: colors.panel, boxShadow: `inset 0 3px 0 #ffffff, 3px 3px 0 ${colors.ink}`, padding: 8, minHeight: 154, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}
            >
              <div style={{ width: 72, height: 72, background: colors.frame, border: `2px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sprite
                  url={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${o.pokeApiId}.png`}
                  size={64}
                  alt={o.name}
                />
              </div>
              <div style={{ ...PIX, fontSize: 8, color: colors.text }}>{cap(o.name)}</div>
              <div style={{ ...VT, fontSize: 15, color: colors.textMuted, lineHeight: 1.1 }}>{o.method}</div>
            </button>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}
