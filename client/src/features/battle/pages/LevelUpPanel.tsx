import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { ConfirmBar } from "../../../components/ConfirmBar";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Card } from "../../../components/ui/card";
import { SearchInput } from "../../../components/SearchInput";
import { SectionLabel } from "../../../components/SectionLabel";
import { Stepper } from "../../../components/Stepper";
import { TypeBadge } from "../../../components/TypeBadge";
import { useLegalMoves } from "../../../hooks/useSpecies";
import {
  useLearnMove,
  useUpdatePokemon,
} from "../../../hooks/usePokemonMutations";
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
  const [preview, setPreview] = useState<LearnMoveResult | null>(null);
  const [replace, setReplace] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const legalMoves = useLegalMoves(saveId, mine.pokeApiId);
  const learnMove = useLearnMove();
  const updatePokemon = useUpdatePokemon();

  const needsReplacement = mine.moves.length >= 4;

  const pool = legalMoves.filter((m) => !mine.moves.includes(m.name));
  const q = query.trim().toLowerCase();
  const results =
    move || !q ? [] : pool.filter((m) => m.name.includes(q)).slice(0, 8);

  const clearMove = () => {
    setMove(null);
    setQuery("");
    setPreview(null);
    setReplace(null);
    setAsking(false);
  };

  const pickMove = async (name: string) => {
    setMove(name);
    setQuery(cap(name));
    setReplace(null);
    setPreview(null);
    setAsking(false);
    if (!needsReplacement) return;

    try {
      // Pokémon já tem 4 moves — evaluateNewMove só compara e nunca aplica
      // nesse caso (ver moveset.service.ts::evaluateNewMove). Seguro chamar
      // aqui, antes de qualquer confirmação, só pra antecipar a comparação.
      const res = await learnMove.mutateAsync({ id: mine.id, moveName: name });
      if (res.outcome === "suggested_replacement") {
        setPreview(res);
      }
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to check move.");
      clearMove();
    }
  };

  const ask = () => {
    if (level < mine.level)
      return onFlash(`Level up cannot be lower than ${mine.level}.`);
    if (move && needsReplacement && !replace)
      return onFlash("Pick which move to replace first.");
    setAsking(true);
  };

  // Único confirm pra tudo: se precisou de troca, aplica o swap de moves e
  // o nível em sequência (duas chamadas, uma ação do usuário); senão, é o
  // mesmo fluxo de sempre — onApply cuida de nível + move num passo só.
  const apply = async () => {
    if (move && needsReplacement && replace) {
      await updatePokemon.mutateAsync({
        id: mine.id,
        input: { moves: mine.moves.map((m) => (m === replace ? move : m)) },
      });
      await onApply(level);
      onFlash(
        `Reached Lv ${level} and learned ${cap(move)}, replacing ${cap(replace)}.`,
      );
      onClose();
      return;
    }

    await onApply(level, move ?? undefined);
    onFlash(
      move
        ? `Reached Lv ${level} and learned ${cap(move)}.`
        : `Now Lv ${level}.`,
    );
    onClose();
  };

  return (
    <PageShell title="LOG LEVEL UP" onBack={onClose}>
      <Card>
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
      </Card>

      <Card>
        <SectionLabel>NEW MOVE (OPTIONAL)</SectionLabel>
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setMove(null);
            setPreview(null);
            setReplace(null);
            setAsking(false);
          }}
          placeholder="search learned move..."
        />
        {results.length > 0 ? (
          <div className="flex max-h-50 flex-col overflow-y-auto border-2 border-ink bg-panel-alt">
            {results.map((m) => (
              <button
                key={m.name}
                onClick={() => void pickMove(m.name)}
                className="flex min-h-12 items-center gap-2 border-0 border-b-2 border-frame-alt bg-transparent p-2.5 text-left"
              >
                <span className="flex-1 font-pix text-[8px] text-text">
                  {cap(m.name)}
                </span>
                <TypeBadge type={m.type} />
              </button>
            ))}
          </div>
        ) : null}
        {!move ? <Hint>Leave blank to just update the level.</Hint> : null}
        {move ? (
          <div className="flex flex-col gap-2 border-2 border-ink bg-panel-alt p-2.5">
            <div className="font-pix text-[8px] text-text-muted">
              {needsReplacement
                ? "MUST REPLACE A MOVE"
                : "GOES INTO A FREE SLOT"}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-1 font-pix text-[8px] text-text">
                {cap(move)}
              </span>
            </div>
            <Button
              variant="danger"
              onClick={clearMove}
              minHeight={40}
              fontSize={8}
              className="self-start"
            >
              X CLEAR MOVE
            </Button>
          </div>
        ) : null}
      </Card>

      {move && needsReplacement ? (
        <Card className="border-[3px] border-yellow bg-yellow-soft">
          <SectionLabel>PICK A MOVE TO REPLACE</SectionLabel>
          {learnMove.isPending && !preview ? (
            <Hint>Checking...</Hint>
          ) : preview?.outcome === "suggested_replacement" ? (
            <>
              <Hint>
                {preview.suggestedReplacement
                  ? `Suggestion: replace ${cap(preview.suggestedReplacement)} (weakest). Tap the move that should go.`
                  : "This move isn't better than anything it currently has — not recommended. Tap a move below to replace it anyway, or clear the move above to skip."}
              </Hint>
              {preview.comparisons.map((c) => (
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
                  <TypeBadge type={c.moveB.type} />
                  <span className="font-vt text-[20px] text-text-muted">
                    score {c.moveB.score}
                  </span>
                </button>
              ))}
            </>
          ) : null}
        </Card>
      ) : null}

      {asking ? (
        <ConfirmBar
          text={
            move && replace
              ? `Go to level ${level} and learn ${cap(move)}, replacing ${cap(replace)}?`
              : move
                ? `Learn ${cap(move)} and go to level ${level}?`
                : `Update ${cap(mine.nickname ?? mine.species?.name)} to level ${level}?`
          }
          confirmLabel="CONFIRM"
          onCancel={() => setAsking(false)}
          onConfirm={() => void apply()}
        />
      ) : (
        <Button variant="primary" full onClick={ask}>
          SAVE LEVEL UP
        </Button>
      )}
    </PageShell>
  );
}
