import { useState } from "react";
import {
  useDeletePokemon,
  useMovePokemon,
  useUpdatePokemon,
} from "../../../hooks/usePokemonMutations";
import { useEvolutions, useMoveTypes } from "../../../hooks/useSpecies";
import { Button } from "../../../components/ui/button";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Card } from "../../../components/ui/card";
import { SectionLabel } from "../../../components/SectionLabel";
import { Sprite } from "../../../components/Sprite";
import { Stepper } from "../../../components/Stepper";
import { TypeBadge } from "../../../components/TypeBadge";
import { cap } from "../../../theme";
import type { PokemonDTO } from "../../../types/pokemon";
import { MovesPage } from "./MovesPage";
import { ItemPage } from "./ItemPage";
import { EvolvePage } from "./EvolvePage";

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
}: {
  saveId: string;
  pokemon: PokemonDTO;
  onBack: () => void;
  onFlash: (msg: string) => void;
}) {
  const [page, setPage] = useState<"detail" | "moves" | "item" | "evolve">(
    "detail",
  );
  const [confirming, setConfirming] = useState(false);
  const [evoInfo, setEvoInfo] = useState(false);
  const { evolutions } = useEvolutions(pokemon.pokeApiId);
  const moveTypes = useMoveTypes(pokemon.moves);
  const updatePokemon = useUpdatePokemon();
  const movePokemon = useMovePokemon();
  const deletePokemon = useDeletePokemon();

  if (page === "moves") {
    return (
      <MovesPage
        saveId={saveId}
        pokemon={pokemon}
        onBack={() => setPage("detail")}
        onFlash={onFlash}
      />
    );
  }
  if (page === "item") {
    return (
      <ItemPage
        pokemon={pokemon}
        onBack={() => setPage("detail")}
        onFlash={onFlash}
      />
    );
  }
  if (page === "evolve") {
    return (
      <EvolvePage
        pokemon={pokemon}
        evolutions={evolutions}
        onBack={() => setPage("detail")}
        onFlash={onFlash}
      />
    );
  }

  const sp = pokemon.species;

  const setLevel = async (level: number) => {
    await updatePokemon.mutateAsync({ id: pokemon.id, input: { level } });
  };

  const toggleLocation = async () => {
    try {
      await movePokemon.mutateAsync({
        id: pokemon.id,
        to: pokemon.location === "PARTY" ? "PC" : "PARTY",
      });
      onFlash(
        pokemon.location === "PARTY"
          ? "Moved to the PC."
          : "Moved to the party.",
      );
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to move pokemon.");
    }
  };

  const confirmDelete = async () => {
    await deletePokemon.mutateAsync(pokemon.id);
    onFlash(`${nameOf(pokemon)} was released.`);
    onBack();
  };

  return (
    <PageShell
      title={`${nameOf(pokemon)} · ${pokemon.location === "PARTY" ? `PARTY ${pokemon.slotPosition ?? "-"}` : "PC"}`}
      onBack={onBack}
    >
      <Card className="items-center">
        <div className="flex size-33 items-center justify-center rounded-base border-[3px] border-ink bg-frame">
          <Sprite url={sp?.sprite} size={120} alt={nameOf(pokemon)} />
        </div>
        <div className="text-center font-pix text-[16px] text-text">
          {nameOf(pokemon)}
        </div>
        <Hint>
          {sp
            ? `#${pokemon.pokeApiId} · ${cap(sp.name)}`
            : "POKEAPI DATA UNAVAILABLE"}
        </Hint>
        <div className="flex flex-wrap justify-center gap-1.5">
          {(sp?.types ?? ["unknown"]).map((t) => (
            <TypeBadge key={t} type={t} size={8} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>LEVEL</SectionLabel>
        <Stepper value={pokemon.level} onChange={(v) => void setLevel(v)} />
      </Card>

      <Card>
        <SectionLabel>BASE STATS</SectionLabel>
        {sp ? (
          STAT_DEFS.map((st) => {
            const value = sp.baseStats[st.key as keyof typeof sp.baseStats];
            const pct = Math.min(100, Math.round((value / 140) * 100));
            return (
              <div key={st.label} className="flex items-center gap-2">
                <div className="w-15.5 flex-none font-pix text-[8px] text-text-muted">
                  {st.label}
                </div>
                <div className="h-4.5 flex-1 overflow-hidden rounded-base border-2 border-ink bg-frame p-0.5">
                  <div
                    className="h-full"
                    style={{ width: `${pct}%`, background: st.color }}
                  />
                </div>
                <div className="w-8 flex-none text-right font-pix text-[8px] text-text">
                  {value}
                </div>
              </div>
            );
          })
        ) : (
          <Hint>Stats unavailable without species data.</Hint>
        )}
      </Card>

      <Card>
        <SectionLabel>MOVES ({pokemon.moves.length}/4)</SectionLabel>
        {pokemon.moves.length === 0 ? (
          <Hint>No moves registered.</Hint>
        ) : (
          pokemon.moves.map((m) => (
            <div
              key={m}
              className="flex min-h-11.5 items-center gap-2 rounded-base border-2 border-ink bg-panel-alt p-2.5"
            >
              <span className="flex-1 font-pix text-[8px] text-text">
                {cap(m)}
              </span>
              <TypeBadge type={moveTypes[m] ?? "unknown"} />
            </div>
          ))
        )}
        <Button variant="primary" full onClick={() => setPage("moves")}>
          CHANGE MOVES
        </Button>
      </Card>

      <Card>
        <SectionLabel>HELD ITEM</SectionLabel>
        <div className="flex min-h-11.5 items-center rounded-base border-2 border-ink bg-panel-alt p-2.5 font-vt text-[16px] text-text">
          {pokemon.heldItem ? cap(pokemon.heldItem) : "NONE"}
        </div>
        <Button variant="secondary" full onClick={() => setPage("item")}>
          {pokemon.heldItem ? "CHANGE / REMOVE ITEM" : "GIVE AN ITEM"}
        </Button>
      </Card>

      <Card>
        <div className="flex gap-2">
          <Button
            variant={evolutions.length ? "secondary" : "ghost"}
            className={`flex-1 ${evolutions.length ? "bg-yellow" : "bg-bg-alt"}`}
            onClick={() =>
              evolutions.length
                ? setPage("evolve")
                : onFlash(`${nameOf(pokemon)} has no known evolution.`)
            }
          >
            {evolutions.length ? "EVOLVE" : "NO EVOLUTION"}
          </Button>
          <Button
            variant={evoInfo ? "primary" : "ghost"}
            className="w-14 flex-none"
            onClick={() => setEvoInfo((v) => !v)}
            fontSize={16}
          >
            i
          </Button>
        </div>
        {evoInfo ? (
          <div className="flex flex-col gap-1.5 rounded-base border-2 border-ink bg-panel-alt p-2.5">
            <div className="font-pix text-[8px] text-text-muted">
              EVOLUTION METHOD
            </div>
            {evolutions.length === 0 ? (
              <div className="font-pix text-[16px] text-text">
                {sp
                  ? `${cap(sp.name)} is in its final form.`
                  : "No species data."}
              </div>
            ) : (
              evolutions.map((e) => (
                <div
                  key={e.pokeApiId}
                  className="font-pix text-[16px] text-text"
                >
                  {cap(e.name)} — {e.method}
                </div>
              ))
            )}
          </div>
        ) : null}
      </Card>

      <Button
        variant="secondary"
        full
        onClick={() => void toggleLocation()}
        className="bg-navy text-white shadow-[inset_0_3px_0_var(--color-navy-light),3px_3px_0_var(--color-ink)] [text-shadow:1px_1px_0_var(--color-ink)]"
      >
        {pokemon.location === "PARTY" ? "MOVE TO PC" : "MOVE TO PARTY"}
      </Button>

      <Button variant="outlineDanger" full onClick={() => setConfirming(true)}>
        DELETE
      </Button>
      <ConfirmDialog
        open={confirming}
        danger
        text={`Delete ${nameOf(pokemon)} forever? This cannot be undone.`}
        confirmLabel="YES, DELETE"
        onCancel={() => setConfirming(false)}
        onConfirm={() => void confirmDelete()}
      />
    </PageShell>
  );
}
