import { useState } from "react";
import { useAddToParty, useAddToPc } from "../../../hooks/usePokemonMutations";
import {
  useLegalMoves,
  useSearchItems,
  useSpecies,
} from "../../../hooks/useSpecies";
import { Button } from "../../../components/ui/button";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Card } from "../../../components/ui/card";
import { SearchInput } from "../../../components/SearchInput";
import { SectionLabel } from "../../../components/SectionLabel";
import { Sprite } from "../../../components/Sprite";
import { Stepper } from "../../../components/Stepper";
import { TypeBadge } from "../../../components/TypeBadge";
import { cap } from "../../../theme";
import type { GenerationSpeciesEntry } from "../../../types/species";

export function AddPage({
  saveId,
  partyFull,
  prefill,
  onBack,
  onDone,
  onFlash,
  dex,
}: {
  saveId: string;
  partyFull: boolean;
  prefill: GenerationSpeciesEntry | null;
  onBack: () => void;
  onDone: () => void;
  onFlash: (msg: string) => void;
  dex: GenerationSpeciesEntry[];
}) {
  const [speciesQuery, setSpeciesQuery] = useState(
    prefill ? cap(prefill.name) : "",
  );
  const [speciesKey, setSpeciesKey] = useState<GenerationSpeciesEntry | null>(
    prefill,
  );
  const [level, setLevel] = useState(5);
  const [nickname, setNickname] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [item, setItem] = useState<string | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [moveQuery, setMoveQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const { species } = useSpecies(speciesKey?.pokeApiId ?? null);
  const legalMoves = useLegalMoves(saveId, speciesKey?.pokeApiId ?? null);
  const itemChoices = useSearchItems(item ? "" : itemQuery);
  const addToParty = useAddToParty();
  const addToPc = useAddToPc();

  const pickSpecies = (entry: GenerationSpeciesEntry | null) => {
    setSpeciesKey(entry);
    setMoves([]);
    setMoveQuery("");
  };

  const trimmedMoveQuery = moveQuery.trim().toLowerCase();
  const shownMoves = trimmedMoveQuery
    ? legalMoves.filter((m) => m.name.includes(trimmedMoveQuery))
    : legalMoves;

  const trimmedSpeciesQuery = speciesQuery.trim().toLowerCase();
  const speciesResults =
    speciesKey || !trimmedSpeciesQuery
      ? []
      : dex.filter((e) => e.name.includes(trimmedSpeciesQuery)).slice(0, 8);

  const toggleMove = (move: string) => {
    setMoves((prev) => {
      if (prev.includes(move)) return prev.filter((m) => m !== move);
      if (prev.length >= 4) {
        onFlash("Max of 4 moves.");
        return prev;
      }
      return [...prev, move];
    });
  };

  const submit = async () => {
    if (!speciesKey) return onFlash("Pick a species first.");
    setBusy(true);
    try {
      const input = {
        saveId,
        pokeApiId: speciesKey.pokeApiId,
        nickname: nickname.trim() || undefined,
        level,
        heldItem: item ?? undefined,
        moves,
      };
      if (partyFull) {
        await addToPc.mutateAsync(input);
        onFlash(`Party full! ${cap(speciesKey.name)} went to the PC.`);
      } else {
        await addToParty.mutateAsync(input);
        onFlash(`${cap(speciesKey.name)} joined the party.`);
      }
      onDone();
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to register pokemon.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="NEW REGISTRATION" onBack={onBack}>
      <Card>
        <SectionLabel>SPECIES *</SectionLabel>
        <div className="flex items-center gap-2">
          <div className="flex size-13 flex-none items-center justify-center rounded-base border-2 border-ink bg-frame">
            <Sprite url={species?.sprite} size={44} alt="sprite" />
          </div>
          <div className="min-w-0 flex-1">
            <SearchInput
              value={speciesQuery}
              onChange={(v) => {
                setSpeciesQuery(v);
                pickSpecies(null);
              }}
              placeholder="search species..."
            />
          </div>
        </div>
        {speciesResults.length > 0 ? (
          <div className="flex max-h-47.5 flex-col overflow-y-auto rounded-base border-2 border-ink bg-panel-alt">
            {speciesResults.map((r) => (
              <button
                key={r.pokeApiId}
                onClick={() => {
                  pickSpecies(r);
                  setSpeciesQuery(cap(r.name));
                }}
                className="flex min-h-12 items-center gap-2 border-0 border-b-2 border-frame-alt bg-transparent p-2 text-left"
              >
                <span className="font-pix text-[8px] text-text">
                  {cap(r.name)}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        <SectionLabel>LEVEL *</SectionLabel>
        <Stepper value={level} onChange={setLevel} />
        <SectionLabel>NICKNAME (OPTIONAL)</SectionLabel>
        <SearchInput
          value={nickname}
          onChange={(v) => setNickname(v.slice(0, 12))}
          placeholder="no nickname"
        />
        <SectionLabel>ITEM (OPTIONAL)</SectionLabel>
        <SearchInput
          value={itemQuery}
          onChange={(v) => {
            setItemQuery(v);
            setItem(null);
          }}
          placeholder="search item..."
        />
        {itemChoices.length > 0 ? (
          <div className="flex max-h-42.5 flex-col overflow-y-auto rounded-base border-2 border-ink bg-panel-alt">
            {itemChoices.map((it) => (
              <button
                key={it}
                onClick={() => {
                  setItem(it);
                  setItemQuery(cap(it));
                }}
                className="flex min-h-11.5 items-center border-0 border-b-2 border-frame-alt bg-panel p-2.5 text-left font-pix text-[8px] text-text"
              >
                {cap(it)}
              </button>
            ))}
          </div>
        ) : null}
        {item ? (
          <Button
            variant="danger"
            onClick={() => {
              setItem(null);
              setItemQuery("");
            }}
            minHeight={40}
            fontSize={8}
          >
            X CLEAR ITEM
          </Button>
        ) : null}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <SectionLabel>MOVES</SectionLabel>
          <div className="font-pix text-[16px] text-red">{moves.length}/4</div>
        </div>
        {!species ? (
          <Hint>Pick a species to see its learnable moves.</Hint>
        ) : (
          <>
            <SearchInput
              value={moveQuery}
              onChange={setMoveQuery}
              placeholder="search moves..."
            />
            <div className="flex max-h-60 flex-col gap-1.5 overflow-y-auto">
              {shownMoves.length === 0 ? (
                <Hint>No learnable move matches "{moveQuery}".</Hint>
              ) : (
                shownMoves.map((m) => {
                  const checked = moves.includes(m.name);
                  return (
                    <button
                      key={m.name}
                      onClick={() => toggleMove(m.name)}
                      className={`flex min-h-12 flex-none items-center gap-2 rounded-base border-2 border-ink p-2.5 text-left ${
                        checked ? "bg-green-soft" : "bg-panel"
                      }`}
                    >
                      <span
                        className={`size-3.5 flex-none rounded-base border-2 border-ink ${checked ? "bg-red" : "bg-white"}`}
                      />
                      <span className="flex-1 font-pix text-[8px] text-text">
                        {cap(m.name)}
                      </span>
                      <TypeBadge type={m.type} />
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </Card>

      <Button variant="primary" full disabled={busy} onClick={() => void submit()}>
        REGISTER POKEMON
      </Button>
    </PageShell>
  );
}
