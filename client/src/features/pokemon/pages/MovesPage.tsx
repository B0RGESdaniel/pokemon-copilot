import { useState } from "react";
import {
  useLearnMove,
  useUpdatePokemon,
} from "../../../hooks/usePokemonMutations";
import { useLegalMoves, useMoveTypes } from "../../../hooks/useSpecies";
import { Btn } from "../../../components/Btn";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Panel } from "../../../components/Panel";
import { SearchInput } from "../../../components/SearchInput";
import { SectionLabel } from "../../../components/SectionLabel";
import { TypeBadge } from "../../../components/TypeBadge";
import { cap } from "../../../theme";
import type { LearnMoveResult, PokemonDTO } from "../../../types/pokemon";

export function MovesPage({
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
  const legalMoves = useLegalMoves(saveId, pokemon.pokeApiId);
  const currentMoveTypes = useMoveTypes(pokemon.moves);
  const [suggestion, setSuggestion] = useState<LearnMoveResult | null>(null);
  const [moveQuery, setMoveQuery] = useState("");
  const updatePokemon = useUpdatePokemon();
  const learnMove = useLearnMove();

  const removeMove = async (move: string) => {
    await updatePokemon.mutateAsync({
      id: pokemon.id,
      input: { moves: pokemon.moves.filter((m) => m !== move) },
    });
    onFlash(`${cap(move)} removed.`);
  };

  const addMove = async (move: string) => {
    setSuggestion(null);
    try {
      const result = await learnMove.mutateAsync({
        id: pokemon.id,
        moveName: move,
      });
      if (result.outcome === "learned_directly") {
        onFlash(`${cap(move)} learned.`);
      } else {
        setSuggestion(result);
      }
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to learn move.");
    }
  };

  const applyReplacement = async (replace: string, move: string) => {
    await updatePokemon.mutateAsync({
      id: pokemon.id,
      input: { moves: pokemon.moves.map((m) => (m === replace ? move : m)) },
    });
    setSuggestion(null);
    onFlash(`${cap(move)} learned, replacing ${cap(replace)}.`);
  };

  const learnable = legalMoves.filter((m) => !pokemon.moves.includes(m.name));
  const trimmedMoveQuery = moveQuery.trim().toLowerCase();
  const shownLearnable = trimmedMoveQuery
    ? learnable.filter((m) => m.name.includes(trimmedMoveQuery))
    : learnable;

  return (
    <PageShell title="CHANGE MOVES" onBack={onBack}>
      <Panel>
        <SectionLabel>CURRENT MOVES ({pokemon.moves.length}/4)</SectionLabel>
        {pokemon.moves.length === 0 ? (
          <Hint>No moves. Pick some below.</Hint>
        ) : (
          pokemon.moves.map((m) => (
            <div
              key={m}
              className="flex min-h-11.5 items-center gap-2 border-2 border-ink bg-panel-alt p-2.5"
            >
              <span className="flex-1 font-pix text-[8px] text-text">
                {cap(m)}
              </span>
              <TypeBadge type={currentMoveTypes[m] ?? "unknown"} />
              <Btn
                variant="danger"
                onClick={() => void removeMove(m)}
                minHeight={40}
                className="size-10 p-0"
                fontSize={8}
              >
                X
              </Btn>
            </div>
          ))
        )}
      </Panel>

      {suggestion?.outcome === "suggested_replacement" ? (
        <Panel className="border-[3px] border-yellow bg-yellow-soft">
          <SectionLabel>ALREADY HAS 4 MOVES</SectionLabel>
          <Hint>
            {suggestion.suggestedReplacement
              ? `Suggestion: replace ${cap(suggestion.suggestedReplacement)} (weakest). Tap the move that should go.`
              : "This move isn't better than anything you currently have — not recommended. Tap a move below to replace it anyway."}
          </Hint>
          {suggestion.comparisons.map((c) => (
            <button
              key={c.moveB.move}
              onClick={() =>
                void applyReplacement(c.moveB.move, suggestion.newMove.move)
              }
              className={`flex min-h-13 items-center gap-2 border-2 border-ink p-2.5 text-left ${
                c.moveB.move === suggestion.suggestedReplacement
                  ? "bg-yellow-soft"
                  : "bg-panel"
              }`}
            >
              <span className="flex-1 font-pix text-[8px] text-text">
                {cap(c.moveB.move)}
              </span>
              <TypeBadge type={c.moveB.type} />
              <span className="font-vt text-[20px] text-text-muted">
                score {c.moveB.score}
              </span>
            </button>
          ))}
          <Btn
            variant="ghost"
            full
            fontSize={8}
            onClick={() => setSuggestion(null)}
          >
            CLOSE
          </Btn>
        </Panel>
      ) : null}

      <Panel>
        <SectionLabel>LEARNABLE</SectionLabel>
        {learnable.length === 0 ? (
          <Hint>No more legal moves to learn for this game.</Hint>
        ) : (
          <>
            <SearchInput
              value={moveQuery}
              onChange={setMoveQuery}
              placeholder="search moves..."
            />
            <div className="flex max-h-60 flex-col gap-1.5 overflow-y-auto">
              {shownLearnable.length === 0 ? (
                <Hint>No learnable move matches "{moveQuery}".</Hint>
              ) : (
                shownLearnable.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => void addMove(m.name)}
                    className="flex min-h-12 flex-none items-center gap-2 border-2 border-ink bg-panel p-2.5 text-left"
                  >
                    <span className="flex-1 font-pix text-[8px] text-text">
                      {cap(m.name)}
                    </span>
                    <TypeBadge type={m.type} />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </Panel>
    </PageShell>
  );
}
