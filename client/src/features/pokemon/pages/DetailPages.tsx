import { useEffect, useState } from "react";
import { deletePokemon, learnMove, movePokemon, updatePokemon } from "../../../api/pokemon";
import { getEvolutions, getLegalMoves, searchItems } from "../../../api/species";
import { Btn, ConfirmBar, Hint, PageShell, Panel, SearchInput, SectionLabel, Sprite, Stepper, TypeBadge } from "../../../components";
import { cap } from "../../../theme";
import type { LearnMoveResult, PokemonDTO } from "../../../types/pokemon";
import type { EvolutionOption } from "../../../types/species";

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
      <Panel className="items-center">
        <div className="flex size-33 items-center justify-center border-[3px] border-ink bg-frame">
          <Sprite url={sp?.sprite} size={120} alt={nameOf(pokemon)} />
        </div>
        <div className="text-center font-pix text-[12px] text-text">{nameOf(pokemon)}</div>
        <Hint>{sp ? `#${pokemon.pokeApiId} · ${cap(sp.name)}` : "POKEAPI DATA UNAVAILABLE"}</Hint>
        <div className="flex flex-wrap justify-center gap-1.5">
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
                <div key={st.label} className="flex items-center gap-2">
                  <div className="w-[62px] flex-none font-pix text-[7px] text-text-muted">{st.label}</div>
                  <div className="h-[18px] flex-1 border-2 border-ink bg-frame p-0.5">
                    <div className="h-full" style={{ width: `${pct}%`, background: st.color }} />
                  </div>
                  <div className="w-8 flex-none text-right font-pix text-[8px] text-text">{value}</div>
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
            <div key={m} className="flex min-h-[46px] items-center gap-2 border-2 border-ink bg-panel-alt p-2.5">
              <span className="flex-1 font-pix text-[8px] text-text">{cap(m)}</span>
            </div>
          ))
        )}
        <Btn variant="primary" full onClick={() => setPage("moves")}>
          CHANGE MOVES
        </Btn>
      </Panel>

      <Panel>
        <SectionLabel>HELD ITEM</SectionLabel>
        <div className="flex min-h-[46px] items-center border-2 border-ink bg-panel-alt p-2.5 font-vt text-[19px] text-text">
          {pokemon.heldItem ? cap(pokemon.heldItem) : "NONE"}
        </div>
        <Btn variant="secondary" full onClick={() => setPage("item")}>
          {pokemon.heldItem ? "CHANGE / REMOVE ITEM" : "GIVE AN ITEM"}
        </Btn>
      </Panel>

      <Panel>
        <div className="flex gap-2">
          <Btn
            variant={evolutions.length ? "secondary" : "ghost"}
            className={`flex-1 ${evolutions.length ? "bg-yellow" : "bg-bg-alt"}`}
            onClick={() => (evolutions.length ? setPage("evolve") : onFlash(`${nameOf(pokemon)} has no known evolution.`))}
          >
            {evolutions.length ? "EVOLVE" : "NO EVOLUTION"}
          </Btn>
          <Btn variant={evoInfo ? "primary" : "ghost"} className="w-14 flex-none" onClick={() => setEvoInfo((v) => !v)} fontSize={12}>
            i
          </Btn>
        </div>
        {evoInfo ? (
          <div className="flex flex-col gap-1.5 border-2 border-ink bg-panel-alt p-2.5">
            <div className="font-pix text-[7px] text-text-muted">EVOLUTION METHOD</div>
            {evolutions.length === 0 ? (
              <div className="font-vt text-[18px] text-text">{sp ? `${cap(sp.name)} is in its final form.` : "No species data."}</div>
            ) : (
              evolutions.map((e) => (
                <div key={e.pokeApiId} className="font-vt text-[18px] text-text">
                  {cap(e.name)} — {e.method}
                </div>
              ))
            )}
          </div>
        ) : null}
      </Panel>

      <Btn
        variant="secondary"
        full
        onClick={() => void toggleLocation()}
        className="bg-navy text-white shadow-[inset_0_3px_0_var(--color-navy-light),3px_3px_0_var(--color-ink)] [text-shadow:1px_1px_0_var(--color-ink)]"
      >
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
            <div key={m} className="flex min-h-[46px] items-center gap-2 border-2 border-ink bg-panel-alt p-2.5">
              <span className="flex-1 font-pix text-[8px] text-text">{cap(m)}</span>
              <Btn variant="danger" onClick={() => void removeMove(m)} minHeight={40} className="size-10 p-0" fontSize={9}>
                X
              </Btn>
            </div>
          ))
        )}
      </Panel>

      {suggestion?.outcome === "suggested_replacement" ? (
        <Panel className="border-[3px] border-yellow bg-yellow-soft">
          <SectionLabel>ALREADY HAS 4 MOVES</SectionLabel>
          <Hint>Suggestion: replace {cap(suggestion.suggestedReplacement)} (weakest). Tap the move that should go.</Hint>
          {suggestion.comparisons.map((c) => (
            <button
              key={c.moveB.move}
              onClick={() => void applyReplacement(c.moveB.move, suggestion.newMove.move)}
              className={`flex min-h-13 items-center gap-2 border-2 border-ink p-2.5 text-left ${
                c.moveB.move === suggestion.suggestedReplacement ? "bg-yellow-soft" : "bg-panel"
              }`}
            >
              <span className="flex-1 font-pix text-[8px] text-text">{cap(c.moveB.move)}</span>
              <span className="font-vt text-[15px] text-text-muted">score {c.moveB.score}</span>
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
            className="flex min-h-12 items-center gap-2 border-2 border-ink bg-panel p-2.5 text-left"
          >
            <span className="flex-1 font-pix text-[8px] text-text">{cap(m)}</span>
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
        <div className="flex min-h-[46px] items-center gap-2 border-2 border-ink bg-panel-alt p-2.5">
          <span className="flex-1 font-vt text-[19px] text-text">{pokemon.heldItem ? cap(pokemon.heldItem) : "NONE"}</span>
          {pokemon.heldItem ? (
            <Btn variant="danger" onClick={() => void remove()} minHeight={40} fontSize={8}>
              REMOVE
            </Btn>
          ) : null}
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="search item..." />
        {choices.length > 0 ? (
          <div className="flex max-h-[230px] flex-col overflow-y-auto border-2 border-ink bg-panel-alt">
            {choices.map((it) => (
              <button
                key={it}
                onClick={() => void pick(it)}
                className={`flex min-h-[46px] items-center border-0 border-b-2 border-frame-alt p-2.5 text-left font-pix text-[8px] text-text ${
                  pokemon.heldItem === it ? "bg-yellow" : "bg-panel"
                }`}
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
        <div className="grid grid-cols-2 gap-2">
          {evolutions.map((o) => (
            <button
              key={o.pokeApiId}
              onClick={() => void pick(o)}
              className="flex min-h-[154px] flex-col items-center gap-1.5 border-[3px] border-ink bg-panel p-2 text-center shadow-[inset_0_3px_0_#ffffff,3px_3px_0_var(--color-ink)]"
            >
              <div className="flex size-18 items-center justify-center border-2 border-ink bg-frame">
                <Sprite
                  url={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${o.pokeApiId}.png`}
                  size={64}
                  alt={o.name}
                />
              </div>
              <div className="font-pix text-[8px] text-text">{cap(o.name)}</div>
              <div className="font-vt text-[15px] leading-[1.1] text-text-muted">{o.method}</div>
            </button>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}
