import { useState } from "react";
import { Btn } from "../../../components/Btn";
import { ConfirmBar } from "../../../components/ConfirmBar";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Panel } from "../../../components/Panel";
import { SearchInput } from "../../../components/SearchInput";
import { SectionLabel } from "../../../components/SectionLabel";
import { Stepper } from "../../../components/Stepper";
import { useLegalMoves } from "../../../hooks/useSpecies";
import { useUpdatePokemon } from "../../../hooks/usePokemonMutations";
import { cap } from "../../../theme";
import type { LearnMoveResult } from "../../../types/pokemon";

export function LevelUpPanel({
  saveId,
  mine,
  onClose,
  onFlash,
  onApply,
}: {
  saveId: string;
  mine: {
    id: string;
    pokeApiId: number;
    level: number;
    moves: string[];
    nickname: string | null;
    species: { name: string } | null;
  };
  onClose: () => void;
  onFlash: (msg: string) => void;
  onApply: (
    level: number,
    moveName?: string,
  ) => Promise<LearnMoveResult | undefined>;
}) {
  const [level, setLevel] = useState(Math.min(100, mine.level + 1));
  const [query, setQuery] = useState("");
  const [move, setMove] = useState<string | null>(null);
  const legalMoves = useLegalMoves(saveId, mine.pokeApiId);
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState<LearnMoveResult | null>(null);
  const [replace, setReplace] = useState<string | null>(null);
  const updatePokemon = useUpdatePokemon();

  const pool = legalMoves.filter((m) => !mine.moves.includes(m));
  const q = query.trim().toLowerCase();
  const results =
    move || !q ? [] : pool.filter((m) => m.includes(q)).slice(0, 8);

  const ask = () => {
    if (level < mine.level)
      return onFlash(`Level up cannot be lower than ${mine.level}.`);
    setAsking(true);
  };

  const apply = async () => {
    const res = await onApply(level, move ?? undefined);
    if (res && res.outcome === "suggested_replacement") {
      setResult(res);
      setAsking(false);
      return;
    }
    onFlash(
      move
        ? `Reached Lv ${level} and learned ${cap(move)}.`
        : `Now Lv ${level}.`,
    );
    onClose();
  };

  const applyReplacement = async () => {
    if (!move || !replace) return;
    await updatePokemon.mutateAsync({
      id: mine.id,
      input: { moves: mine.moves.map((m) => (m === replace ? move : m)) },
    });
    onFlash(`${cap(move)} learned, replacing ${cap(replace)}.`);
    onClose();
  };

  if (result?.outcome === "suggested_replacement") {
    return (
      <PageShell title="LOG LEVEL UP" onBack={onClose}>
        <Panel className="border-[3px] border-yellow bg-yellow-soft">
          <SectionLabel>ALREADY HAS 4 MOVES</SectionLabel>
          <Hint>
            {result.suggestedReplacement
              ? `Suggestion: replace ${cap(result.suggestedReplacement)} (weakest). Tap the move that should go.`
              : "This move isn't better than anything it currently has — not recommended. Tap a move below to replace it anyway."}
          </Hint>
          {result.comparisons.map((c) => (
            <button
              key={c.moveB.move}
              onClick={() => setReplace(c.moveB.move)}
              className={`flex min-h-13 items-center gap-2 border-2 border-ink p-2.5 text-left ${
                c.moveB.move === replace ? "bg-green-soft" : "bg-panel"
              }`}
            >
              <span className="flex-1 font-pix text-[8px] text-text">
                {cap(c.moveB.move)}
              </span>
              <span className="font-pix text-[16px] text-text-muted">
                score {c.moveB.score}
              </span>
            </button>
          ))}
          <Btn
            variant="primary"
            full
            disabled={!replace}
            onClick={() => void applyReplacement()}
          >
            CONFIRM REPLACEMENT
          </Btn>
          <Btn
            variant="ghost"
            full
            fontSize={8}
            onClick={() => {
              setResult(null);
              setReplace(null);
            }}
          >
            CLOSE
          </Btn>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell title="LOG LEVEL UP" onBack={onClose}>
      <Panel>
        <SectionLabel>
          NEW LEVEL FOR {cap(mine.nickname ?? mine.species?.name)}
        </SectionLabel>
        <Hint>
          Current level: {mine.level} · {mine.moves.length}/4 moves
        </Hint>
        <Stepper
          value={level}
          onChange={(v) => {
            setLevel(v);
            setAsking(false);
          }}
        />
      </Panel>

      <Panel>
        <SectionLabel>NEW MOVE (OPTIONAL)</SectionLabel>
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setMove(null);
            setAsking(false);
          }}
          placeholder="search learned move..."
        />
        {results.length > 0 ? (
          <div className="flex max-h-50 flex-col overflow-y-auto border-2 border-ink bg-panel-alt">
            {results.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMove(m);
                  setQuery(cap(m));
                }}
                className="flex min-h-12 items-center gap-2 border-0 border-b-2 border-frame-alt bg-transparent p-2.5 text-left"
              >
                <span className="flex-1 font-pix text-[8px] text-text">
                  {cap(m)}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {!move ? <Hint>Leave blank to just update the level.</Hint> : null}
        {move ? (
          <div className="flex flex-col gap-2 border-2 border-ink bg-panel-alt p-2.5">
            <div className="font-pix text-[8px] text-text-muted">
              {mine.moves.length >= 4
                ? "MUST REPLACE A MOVE"
                : "GOES INTO A FREE SLOT"}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-1 font-pix text-[8px] text-text">
                {cap(move)}
              </span>
            </div>
            <Btn
              variant="danger"
              onClick={() => {
                setMove(null);
                setQuery("");
                setAsking(false);
              }}
              minHeight={40}
              fontSize={8}
              className="self-start"
            >
              X CLEAR MOVE
            </Btn>
          </div>
        ) : null}
      </Panel>

      {asking ? (
        <ConfirmBar
          text={
            move
              ? `Learn ${cap(move)} and go to level ${level}?`
              : `Update ${cap(mine.nickname ?? mine.species?.name)} to level ${level}?`
          }
          confirmLabel="CONFIRM"
          onCancel={() => setAsking(false)}
          onConfirm={() => void apply()}
        />
      ) : (
        <Btn variant="primary" full onClick={ask}>
          SAVE LEVEL UP
        </Btn>
      )}
    </PageShell>
  );
}
