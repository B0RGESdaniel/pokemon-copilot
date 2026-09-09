import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { tv } from "tailwind-variants";
import { getMove } from "../../api/species";
import { queryKeys } from "../../api/queryKeys";
import {
  Btn,
  ConfirmBar,
  Hint,
  PageShell,
  Panel,
  SearchInput,
  SectionLabel,
  Sprite,
  Stepper,
  TypeBadge,
} from "../../components";
import { effectivenessBadge, multiplierAgainst } from "../../utils/effectiveness";
import type { useBattle } from "../../hooks/useBattle";
import { useBattleSuggestions } from "../../hooks/useBattle";
import { useTypeChart } from "../../hooks/data";
import { useLegalMoves } from "../../hooks/useSpecies";
import { useUpdatePokemon } from "../../hooks/usePokemonMutations";
import { cap } from "../../theme";
import type { LearnMoveResult } from "../../types/pokemon";
import type { GenerationSpeciesEntry, MoveDTO } from "../../types/species";

type Panel = "attack" | "opp" | "matchup" | "levelup" | null;

export function BattleTab({
  saveId,
  generation,
  dex,
  battle,
  onFlash,
}: {
  saveId: string;
  generation: number;
  dex: GenerationSpeciesEntry[];
  battle: ReturnType<typeof useBattle>;
  onFlash: (msg: string) => void;
}) {
  const { chart } = useTypeChart(generation);
  const [panel, setPanel] = useState<Panel>(null);
  const [confirm, setConfirm] = useState<"fainted" | "flee" | null>(null);

  const status = battle.status;

  if (!status || battle.loading) {
    return <div className="p-5 font-vt text-[18px] text-text-muted">Loading battle...</div>;
  }

  if (status.status === "not_started") {
    return (
      <div className="p-2.5">
        <Panel className="items-center text-center">
          <div className="font-pix text-[11px] text-text">NO BATTLE YET</div>
          <Hint>Start a battle to bring out your slot 1 pokemon.</Hint>
          <Btn variant="primary" full onClick={() => void battle.start().catch((e) => onFlash(String(e.message ?? e)))}>
            START BATTLE
          </Btn>
        </Panel>
      </div>
    );
  }

  if (status.status === "ended") {
    const text =
      status.endReason === "opponent_fainted"
        ? `${cap(status.opponent?.species?.name)} was marked as fainted. Battle over.`
        : "You ran from the battle. Nothing was marked as fainted.";
    return (
      <div className="p-2.5">
        <Panel className="items-center text-center">
          <div className="font-pix text-[11px] text-text">BATTLE OVER</div>
          <Hint>{text}</Hint>
          <Btn variant="primary" full onClick={() => void battle.start()}>
            FIND NEW OPPONENT
          </Btn>
        </Panel>
      </div>
    );
  }

  // status.status === "active"
  const mine = status.activePokemon;
  const opponent = status.opponent;
  const mineTypes = mine.species?.types ?? [];
  const oppTypes = opponent?.species?.types ?? [];

  return (
    <div className="relative h-full">
      <div className="flex flex-col gap-2 p-2.5">
        <div className="flex items-stretch gap-2">
          <div className="flex w-28 flex-none flex-col gap-1.5">
            <Btn variant="outlineDanger" onClick={() => setConfirm("fainted")} className="flex-1" fontSize={8}>
              FAINTED
            </Btn>
            <Btn variant="secondary" onClick={() => setPanel("opp")} className="flex-1" fontSize={8}>
              SWITCH
            </Btn>
          </div>
          <Panel className="min-w-0 flex-1">
            <div className="font-pix text-[8px] text-red">OPPONENT</div>
            <div className="font-pix text-[11px] leading-[1.4] break-words text-text">
              {opponent ? cap(opponent.species?.name ?? "unknown") : "NONE"}
            </div>
            <div className="font-vt text-[21px] leading-none text-text-muted">
              {opponent ? `Lv ${opponent.level}` : "not set"}
            </div>
            <div className="flex flex-wrap gap-1">
              {oppTypes.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          </Panel>
        </div>

        <div className="relative h-[216px] overflow-hidden border-[3px] border-ink bg-[#2d4b34] bg-[url('/battle-background.webp')] bg-cover bg-center shadow-[3px_3px_0_var(--color-ink)]">
          <div className="absolute top-[26px] right-19 flex h-35 w-35 items-center justify-center">
            <Sprite url={opponent?.species?.sprite} size={132} alt={opponent?.species?.name ?? "opponent"} />
          </div>
          <div className="absolute -bottom-1.5 left-[58px] flex h-[154px] w-[154px] items-end justify-center">
            <img
              src={mine.species?.sprite ?? undefined}
              alt={mine.nickname ?? mine.species?.name ?? "mine"}
              className="h-37 w-37 -scale-x-100 object-contain"
            />
          </div>
          <div className="absolute right-2 bottom-1.5 font-vt text-[15px] text-white [text-shadow:1px_1px_0_var(--color-ink)]">
            reference only · no damage math
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <Panel className="min-w-0 flex-1 shadow-[inset_0_3px_0_#ffffff,3px_3px_0_var(--color-ink)]">
            <div className="font-pix text-[8px] text-blue">ON FIELD</div>
            <div className="font-pix text-[11px] leading-[1.4] break-words text-text">
              {mine.nickname ?? cap(mine.species?.name)}
            </div>
            <div className="font-vt text-[21px] leading-none text-text-muted">Lv {mine.level}</div>
            <div className="flex flex-wrap gap-1">
              {mineTypes.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
            <Btn variant="secondary" full onClick={() => setPanel("levelup")} className="mt-auto" fontSize={8} minHeight={42}>
              LEVEL UP
            </Btn>
          </Panel>
          <div className="flex w-[138px] flex-none flex-col gap-1.5">
            <Btn variant="primary" onClick={() => setPanel("attack")} fontSize={8}>
              ATTACK
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => setPanel("matchup")}
              className="bg-yellow shadow-[inset_0_3px_0_var(--color-yellow-light),3px_3px_0_var(--color-ink)]"
              fontSize={8}
            >
              SWITCH POKEMON
            </Btn>
            <Btn variant="ghost" onClick={() => setConfirm("flee")} className="bg-bg-alt text-text-muted" fontSize={8}>
              RUN
            </Btn>
          </div>
        </div>

        {confirm ? (
          <ConfirmBar
            danger
            text={
              confirm === "fainted"
                ? `Mark ${cap(opponent?.species?.name)} as fainted and end the battle? This cannot be undone.`
                : "Run and end the battle without marking anything as fainted?"
            }
            confirmLabel={confirm === "fainted" ? "YES, FAINTED" : "YES, RUN"}
            onCancel={() => setConfirm(null)}
            onConfirm={() => {
              void battle.end(confirm === "fainted" ? "opponent_fainted" : "fled");
              setConfirm(null);
            }}
          />
        ) : null}
      </div>

      {panel === "attack" ? <AttackPanel mine={mine} oppTypes={oppTypes} chart={chart} onClose={() => setPanel(null)} /> : null}
      {panel === "opp" ? (
        <OpponentPanel
          dex={dex}
          onClose={() => setPanel(null)}
          onApply={async (pokeApiId, level) => {
            await battle.setOpponent(pokeApiId, level);
            setPanel(null);
            onFlash("Opponent set.");
          }}
        />
      ) : null}
      {panel === "matchup" ? (
        <MatchupPanel
          saveId={saveId}
          activeId={mine.id}
          onClose={() => setPanel(null)}
          onPick={async (id) => {
            await battle.setActive(id);
            setPanel(null);
          }}
        />
      ) : null}
      {panel === "levelup" ? (
        <LevelUpPanel
          saveId={saveId}
          mine={mine}
          onClose={() => setPanel(null)}
          onFlash={onFlash}
          onApply={async (level, moveName) => {
            const result = await battle.levelUp(level, moveName);
            return result.moveEvaluation ?? undefined;
          }}
        />
      ) : null}
    </div>
  );
}

function AttackPanel({
  mine,
  oppTypes,
  chart,
  onClose,
}: {
  mine: {
    moves: string[];
    nickname: string | null;
    species: { name: string; types: string[] } | null;
  };
  oppTypes: string[];
  chart: ReturnType<typeof useTypeChart>["chart"];
  onClose: () => void;
}) {
  const moveQueries = useQueries({
    queries: mine.moves.map((m) => ({
      queryKey: queryKeys.move(m),
      queryFn: () => getMove(m),
      staleTime: Infinity,
    })),
  });

  const rows: (MoveDTO & { effLabel: string; effClassName: string })[] = moveQueries
    .map((q) => q.data)
    .filter((mv): mv is MoveDTO => !!mv)
    .map((mv) => {
      if (mv.damageClass === "status" || mv.power === null) {
        return { ...mv, effLabel: "STATUS", effClassName: "bg-border text-text-muted" };
      }
      const v = chart ? multiplierAgainst(mv.type, oppTypes, chart) : 1;
      const badge = effectivenessBadge(v);
      return { ...mv, effLabel: badge.label, effClassName: badge.className };
    });

  return (
    <PageShell title="MOVES" onBack={onClose}>
      <Panel>
        <SectionLabel>{cap(mine.nickname ?? mine.species?.name)} MOVES</SectionLabel>
        <Hint>Reference only. Effectiveness vs {cap(oppTypes.join("/") || "opponent")}:</Hint>
        {rows.length === 0 ? <Hint>This pokemon has no registered moves.</Hint> : null}
        {rows.map((m) => (
          <div key={m.name} className="flex min-h-13 items-center gap-2 border-2 border-ink bg-panel-alt p-2.5">
            <span className="flex-1 font-pix text-[8px] text-text">{cap(m.name)}</span>
            <TypeBadge type={m.type} size={6} />
            <span className="font-vt text-[16px] whitespace-nowrap text-text">{m.power ? `PWR ${m.power}` : "—"}</span>
            <span className={`border-2 border-ink px-[5px] py-1 font-pix text-[7px] whitespace-nowrap ${m.effClassName}`}>
              {m.effLabel}
            </span>
          </div>
        ))}
        <Btn variant="secondary" full onClick={onClose}>
          CLOSE
        </Btn>
      </Panel>
    </PageShell>
  );
}

function OpponentPanel({
  dex,
  onClose,
  onApply,
}: {
  dex: GenerationSpeciesEntry[];
  onClose: () => void;
  onApply: (pokeApiId: number, level: number) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<GenerationSpeciesEntry | null>(null);
  const [level, setLevel] = useState(20);
  const results = picked ? [] : dex.filter((e) => e.name.includes(query.trim().toLowerCase())).slice(0, 8);

  return (
    <PageShell title="SWITCH OPPONENT" onBack={onClose}>
      <Panel>
        <SectionLabel>OPPONENT SPECIES *</SectionLabel>
        <div className="flex items-center gap-2">
          <div className="flex size-13 flex-none items-center justify-center border-2 border-ink bg-frame">
            <Sprite
              url={
                picked
                  ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${picked.pokeApiId}.png`
                  : null
              }
              size={44}
              alt="sprite"
            />
          </div>
          <div className="min-w-0 flex-1">
            <SearchInput
              value={query}
              onChange={(v) => {
                setQuery(v);
                setPicked(null);
              }}
              placeholder="search species..."
            />
          </div>
        </div>
        {results.length > 0 ? (
          <div className="flex max-h-[210px] flex-col overflow-y-auto border-2 border-ink bg-panel-alt">
            {results.map((r) => (
              <button
                key={r.pokeApiId}
                onClick={() => {
                  setPicked(r);
                  setQuery(cap(r.name));
                }}
                className="flex min-h-12 items-center gap-2 border-0 border-b-2 border-frame-alt bg-transparent p-2 text-left"
              >
                <span className="font-pix text-[8px] text-text">{cap(r.name)}</span>
              </button>
            ))}
          </div>
        ) : null}
        <SectionLabel>LEVEL *</SectionLabel>
        <Stepper value={level} onChange={setLevel} />
        <Btn variant="primary" full disabled={!picked} onClick={() => picked && void onApply(picked.pokeApiId, level)}>
          SET OPPONENT
        </Btn>
      </Panel>
    </PageShell>
  );
}

const matchupGrade = tv({
  variants: {
    tier: {
      great: "bg-green text-ink",
      good: "bg-green-soft text-ink",
      bad: "bg-red text-white",
      neutral: "bg-border text-text-muted",
    },
  },
});

function MatchupPanel({
  saveId,
  activeId,
  onClose,
  onPick,
}: {
  saveId: string;
  activeId: string;
  onClose: () => void;
  onPick: (id: string) => Promise<void>;
}) {
  const suggestions = useBattleSuggestions(saveId);
  const oppName = suggestions ? cap(suggestions.opponent.species?.name) : "";

  return (
    <PageShell title="TEAM MATCHUP" onBack={onClose}>
      <Panel>
        <SectionLabel>MATCHUP VS {oppName}</SectionLabel>
        <Hint>Best to worst matchup. Tap to send out.</Hint>
        {(suggestions?.ranking ?? []).map((r, i) => {
          const active = r.pokemon.id === activeId;
          const gradeTier =
            r.matchup.score >= 1.5 ? "great" : r.matchup.score > 0 ? "good" : r.matchup.score < 0 ? "bad" : "neutral";
          const grade = {
            label: { great: "GREAT", good: "GOOD", bad: "BAD", neutral: "NEUTRAL" }[gradeTier],
            className: matchupGrade({ tier: gradeTier }),
          };
          return (
            <button
              key={r.pokemon.id}
              onClick={() => (active ? undefined : void onPick(r.pokemon.id))}
              className={`flex min-h-[70px] w-full items-center gap-2.5 border-[3px] border-ink p-2 text-left shadow-[3px_3px_0_var(--color-ink)] ${
                active ? "bg-panel-alt" : "bg-panel"
              }`}
            >
              <div className="flex size-[54px] flex-none items-center justify-center border-2 border-ink bg-frame">
                <Sprite url={r.pokemon.species?.sprite} size={46} alt={r.pokemon.nickname ?? undefined} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                <div className="font-pix text-[8px] text-text">
                  {i + 1}. {r.pokemon.nickname ?? cap(r.pokemon.species?.name)}
                </div>
                <div className="font-vt text-[16px] text-text-muted">
                  Lv {r.pokemon.level} {active ? "· ON FIELD" : `· slot ${r.pokemon.slotPosition ?? "-"}`}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(r.pokemon.species?.types ?? []).map((t) => (
                    <TypeBadge key={t} type={t} size={6} />
                  ))}
                </div>
              </div>
              <div className="flex flex-none flex-col items-end gap-1">
                <span className={`border-2 border-ink px-[5px] py-1 font-pix text-[7px] ${grade.className}`}>
                  {grade.label}
                </span>
                <span className="font-vt text-[15px] text-text-muted">
                  deals x{r.matchup.offensiveMultiplier} / takes x{r.matchup.defensiveMultiplier}
                </span>
              </div>
            </button>
          );
        })}
      </Panel>
    </PageShell>
  );
}

function LevelUpPanel({
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
  onApply: (level: number, moveName?: string) => Promise<LearnMoveResult | undefined>;
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
  const results = move ? [] : pool.filter((m) => m.includes(q)).slice(0, 8);

  const ask = () => {
    if (level < mine.level) return onFlash(`Level up cannot be lower than ${mine.level}.`);
    setAsking(true);
  };

  const apply = async () => {
    const res = await onApply(level, move ?? undefined);
    if (res && res.outcome === "suggested_replacement") {
      setResult(res);
      setAsking(false);
      return;
    }
    onFlash(move ? `Reached Lv ${level} and learned ${cap(move)}.` : `Now Lv ${level}.`);
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
          <Hint>Suggestion: replace {cap(result.suggestedReplacement)} (weakest). Tap the move that should go.</Hint>
          {result.comparisons.map((c) => (
            <button
              key={c.moveB.move}
              onClick={() => setReplace(c.moveB.move)}
              className={`flex min-h-13 items-center gap-2 border-2 border-ink p-2.5 text-left ${
                c.moveB.move === replace ? "bg-green-soft" : "bg-panel"
              }`}
            >
              <span className="flex-1 font-pix text-[8px] text-text">{cap(c.moveB.move)}</span>
              <span className="font-vt text-[15px] text-text-muted">score {c.moveB.score}</span>
            </button>
          ))}
          <Btn variant="primary" full disabled={!replace} onClick={() => void applyReplacement()}>
            CONFIRM REPLACEMENT
          </Btn>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell title="LOG LEVEL UP" onBack={onClose}>
      <Panel>
        <SectionLabel>NEW LEVEL FOR {cap(mine.nickname ?? mine.species?.name)}</SectionLabel>
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
          <div className="flex max-h-[200px] flex-col overflow-y-auto border-2 border-ink bg-panel-alt">
            {results.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMove(m);
                  setQuery(cap(m));
                }}
                className="flex min-h-12 items-center gap-2 border-0 border-b-2 border-frame-alt bg-transparent p-2.5 text-left"
              >
                <span className="flex-1 font-pix text-[8px] text-text">{cap(m)}</span>
              </button>
            ))}
          </div>
        ) : null}
        {!move ? <Hint>Leave blank to just update the level.</Hint> : null}
        {move ? (
          <div className="flex flex-col gap-2 border-2 border-ink bg-panel-alt p-2.5">
            <div className="font-pix text-[7px] text-text-muted">
              {mine.moves.length >= 4 ? "MUST REPLACE A MOVE" : "GOES INTO A FREE SLOT"}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-1 font-pix text-[8px] text-text">{cap(move)}</span>
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
