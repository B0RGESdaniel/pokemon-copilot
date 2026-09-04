import { useEffect, useState } from "react";
import { getBattleSuggestions, getLegalMoves, getMove, updatePokemon } from "./api";
import { effectivenessBadge, multiplierAgainst } from "./effectiveness";
import type { useBattle } from "./hooks/useBattle";
import { useTypeChart } from "./hooks/data";
import { colors, PIX, VT, cap } from "./theme";
import { Btn, ConfirmBar, Hint, PageShell, Panel, SearchInput, SectionLabel, Sprite, Stepper, TypeBadge } from "./ui";
import type { GenerationSpeciesEntry, LearnMoveResult, MoveDTO, PartyMatchup } from "./types";

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
    return <div style={{ padding: 20, ...VT, fontSize: 18, color: colors.textMuted }}>Loading battle...</div>;
  }

  if (status.status === "not_started") {
    return (
      <div style={{ padding: 10 }}>
        <Panel style={{ alignItems: "center", textAlign: "center" }}>
          <div style={{ ...PIX, fontSize: 11, color: colors.text }}>NO BATTLE YET</div>
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
      <div style={{ padding: 10 }}>
        <Panel style={{ alignItems: "center", textAlign: "center" }}>
          <div style={{ ...PIX, fontSize: 11, color: colors.text }}>BATTLE OVER</div>
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
    <div style={{ position: "relative", height: "100%" }}>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          <div style={{ flex: "0 0 112px", display: "flex", flexDirection: "column", gap: 6 }}>
            <Btn variant="outlineDanger" onClick={() => setConfirm("fainted")} style={{ flex: "1 1 0" }} fontSize={8}>
              FAINTED
            </Btn>
            <Btn variant="secondary" onClick={() => setPanel("opp")} style={{ flex: "1 1 0" }} fontSize={8}>
              SWITCH
            </Btn>
          </div>
          <Panel style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div style={{ ...PIX, fontSize: 8, color: colors.red }}>OPPONENT</div>
            <div style={{ ...PIX, fontSize: 11, color: colors.text, lineHeight: 1.4, wordBreak: "break-word" }}>
              {opponent ? cap(opponent.species?.name ?? "unknown") : "NONE"}
            </div>
            <div style={{ ...VT, fontSize: 21, lineHeight: 1, color: colors.textMuted }}>{opponent ? `Lv ${opponent.level}` : "not set"}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {oppTypes.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          </Panel>
        </div>

        <div style={{ position: "relative", height: 216, border: `3px solid ${colors.ink}`, boxShadow: `3px 3px 0 ${colors.ink}`, backgroundColor: "#2d4b34", backgroundImage: "url('/battle-background.webp')", backgroundSize: "cover", backgroundPosition: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 26, right: 76, width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sprite url={opponent?.species?.sprite} size={132} alt={opponent?.species?.name ?? "opponent"} />
          </div>
          <div style={{ position: "absolute", bottom: -6, left: 58, width: 154, height: 154, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <img
              src={mine.species?.sprite ?? undefined}
              alt={mine.nickname ?? mine.species?.name ?? "mine"}
              style={{ width: 148, height: 148, objectFit: "contain", imageRendering: "pixelated", transform: "scaleX(-1)" }}
            />
          </div>
          <div style={{ position: "absolute", bottom: 6, right: 8, ...VT, fontSize: 15, color: colors.white, textShadow: `1px 1px 0 ${colors.ink}` }}>
            reference only · no damage math
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          <Panel style={{ flex: "1 1 auto", minWidth: 0, boxShadow: `inset 0 3px 0 #ffffff, 3px 3px 0 ${colors.ink}` }}>
            <div style={{ ...PIX, fontSize: 8, color: colors.blue }}>ON FIELD</div>
            <div style={{ ...PIX, fontSize: 11, color: colors.text, lineHeight: 1.4, wordBreak: "break-word" }}>
              {mine.nickname ?? cap(mine.species?.name)}
            </div>
            <div style={{ ...VT, fontSize: 21, lineHeight: 1, color: colors.textMuted }}>Lv {mine.level}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {mineTypes.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
            <Btn variant="secondary" full onClick={() => setPanel("levelup")} style={{ marginTop: "auto" }} fontSize={8} minHeight={42}>
              LEVEL UP
            </Btn>
          </Panel>
          <div style={{ flex: "0 0 138px", display: "flex", flexDirection: "column", gap: 6 }}>
            <Btn variant="primary" onClick={() => setPanel("attack")} fontSize={8}>
              ATTACK
            </Btn>
            <Btn variant="secondary" onClick={() => setPanel("matchup")} style={{ background: colors.yellow, boxShadow: `inset 0 3px 0 ${colors.yellowLight}, 3px 3px 0 ${colors.ink}` }} fontSize={8}>
              SWITCH POKEMON
            </Btn>
            <Btn variant="ghost" onClick={() => setConfirm("flee")} style={{ background: colors.bgAlt, color: colors.textMuted }} fontSize={8}>
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

      {panel === "attack" ? (
        <AttackPanel mine={mine} oppTypes={oppTypes} chart={chart} onClose={() => setPanel(null)} />
      ) : null}
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
          onReload={() => battle.reload()}
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
  mine: { moves: string[]; nickname: string | null; species: { name: string; types: string[] } | null };
  oppTypes: string[];
  chart: ReturnType<typeof useTypeChart>["chart"];
  onClose: () => void;
}) {
  const [rows, setRows] = useState<(MoveDTO & { effLabel: string; effBg: string; effFg: string })[]>([]);

  useEffect(() => {
    Promise.all(mine.moves.map((m) => getMove(m))).then((moves) => {
      setRows(
        moves.map((mv) => {
          if (mv.damageClass === "status" || mv.power === null) {
            return { ...mv, effLabel: "STATUS", effBg: colors.border, effFg: colors.textMuted };
          }
          const v = chart ? multiplierAgainst(mv.type, oppTypes, chart) : 1;
          const badge = effectivenessBadge(v);
          return { ...mv, effLabel: badge.label, effBg: badge.bg, effFg: badge.fg };
        }),
      );
    });
  }, [mine.moves, oppTypes, chart]);

  return (
    <PageShell title="MOVES" onBack={onClose}>
      <Panel>
        <SectionLabel>{cap(mine.nickname ?? mine.species?.name)} MOVES</SectionLabel>
        <Hint>Reference only. Effectiveness vs {cap(oppTypes.join("/") || "opponent")}:</Hint>
        {rows.length === 0 ? <Hint>This pokemon has no registered moves.</Hint> : null}
        {rows.map((m) => (
          <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${colors.ink}`, background: colors.panelAlt, padding: 10, minHeight: 52 }}>
            <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(m.name)}</span>
            <TypeBadge type={m.type} size={6} />
            <span style={{ ...VT, fontSize: 16, color: colors.text, whiteSpace: "nowrap" }}>{m.power ? `PWR ${m.power}` : "—"}</span>
            <span style={{ ...PIX, fontSize: 7, padding: "4px 5px", border: `2px solid ${colors.ink}`, background: m.effBg, color: m.effFg, whiteSpace: "nowrap" }}>{m.effLabel}</span>
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 52, height: 52, flex: "0 0 52px", background: colors.frame, border: `2px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sprite url={picked ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${picked.pokeApiId}.png` : null} size={44} alt="sprite" />
          </div>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
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
          <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, maxHeight: 210, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {results.map((r) => (
              <button
                key={r.pokeApiId}
                onClick={() => {
                  setPicked(r);
                  setQuery(cap(r.name));
                }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, minHeight: 48, background: "none", border: "none", borderBottom: `2px solid ${colors.frameAlt}`, textAlign: "left" }}
              >
                <span style={{ ...PIX, fontSize: 8, color: colors.text }}>{cap(r.name)}</span>
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
  const [ranking, setRanking] = useState<PartyMatchup[] | null>(null);
  const [oppName, setOppName] = useState("");

  useEffect(() => {
    getBattleSuggestions(saveId).then((r) => {
      setRanking(r.ranking);
      setOppName(cap(r.opponent.species?.name));
    });
  }, [saveId]);

  return (
    <PageShell title="TEAM MATCHUP" onBack={onClose}>
      <Panel>
        <SectionLabel>MATCHUP VS {oppName}</SectionLabel>
        <Hint>Best to worst matchup. Tap to send out.</Hint>
        {(ranking ?? []).map((r, i) => {
          const active = r.pokemon.id === activeId;
          const grade =
            r.matchup.score >= 1.5
              ? { label: "GREAT", bg: colors.green, fg: colors.ink }
              : r.matchup.score > 0
                ? { label: "GOOD", bg: colors.greenSoft, fg: colors.ink }
                : r.matchup.score < 0
                  ? { label: "BAD", bg: colors.red, fg: colors.white }
                  : { label: "NEUTRAL", bg: colors.border, fg: colors.textMuted };
          return (
            <button
              key={r.pokemon.id}
              onClick={() => (active ? undefined : void onPick(r.pokemon.id))}
              style={{ width: "100%", border: `3px solid ${colors.ink}`, background: active ? colors.panelAlt : colors.panel, boxShadow: `3px 3px 0 ${colors.ink}`, padding: 8, display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 70 }}
            >
              <div style={{ width: 54, height: 54, flex: "0 0 54px", background: colors.frame, border: `2px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sprite url={r.pokemon.species?.sprite} size={46} alt={r.pokemon.nickname ?? undefined} />
              </div>
              <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ ...PIX, fontSize: 8, color: colors.text }}>
                  {i + 1}. {r.pokemon.nickname ?? cap(r.pokemon.species?.name)}
                </div>
                <div style={{ ...VT, fontSize: 16, color: colors.textMuted }}>
                  Lv {r.pokemon.level} {active ? "· ON FIELD" : `· slot ${r.pokemon.slotPosition ?? "-"}`}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(r.pokemon.species?.types ?? []).map((t) => (
                    <TypeBadge key={t} type={t} size={6} />
                  ))}
                </div>
              </div>
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <span style={{ ...PIX, fontSize: 7, padding: "4px 5px", border: `2px solid ${colors.ink}`, background: grade.bg, color: grade.fg }}>{grade.label}</span>
                <span style={{ ...VT, fontSize: 15, color: colors.textMuted }}>
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
  onReload,
}: {
  saveId: string;
  mine: { id: string; pokeApiId: number; level: number; moves: string[]; nickname: string | null; species: { name: string } | null };
  onClose: () => void;
  onFlash: (msg: string) => void;
  onApply: (level: number, moveName?: string) => Promise<LearnMoveResult | undefined>;
  onReload: () => Promise<void>;
}) {
  const [level, setLevel] = useState(Math.min(100, mine.level + 1));
  const [query, setQuery] = useState("");
  const [move, setMove] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState<LearnMoveResult | null>(null);
  const [replace, setReplace] = useState<string | null>(null);

  useEffect(() => {
    getLegalMoves(saveId, mine.pokeApiId).then(setLegalMoves);
  }, [saveId, mine.pokeApiId]);

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
    await updatePokemon(mine.id, { moves: mine.moves.map((m) => (m === replace ? move : m)) });
    await onReload();
    onFlash(`${cap(move)} learned, replacing ${cap(replace)}.`);
    onClose();
  };

  if (result?.outcome === "suggested_replacement") {
    return (
      <PageShell title="LOG LEVEL UP" onBack={onClose}>
        <Panel style={{ border: `3px solid ${colors.yellow}`, background: colors.yellowSoft }}>
          <SectionLabel>ALREADY HAS 4 MOVES</SectionLabel>
          <Hint>Suggestion: replace {cap(result.suggestedReplacement)} (weakest). Tap the move that should go.</Hint>
          {result.comparisons.map((c) => (
            <button
              key={c.moveB.move}
              onClick={() => setReplace(c.moveB.move)}
              style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${colors.ink}`, background: c.moveB.move === replace ? colors.greenSoft : colors.panel, padding: 10, minHeight: 52, textAlign: "left" }}
            >
              <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(c.moveB.move)}</span>
              <span style={{ ...VT, fontSize: 15, color: colors.textMuted }}>score {c.moveB.score}</span>
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
          <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {results.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMove(m);
                  setQuery(cap(m));
                }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, minHeight: 48, background: "none", border: "none", borderBottom: `2px solid ${colors.frameAlt}`, textAlign: "left" }}
              >
                <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(m)}</span>
              </button>
            ))}
          </div>
        ) : null}
        {!move ? <Hint>Leave blank to just update the level.</Hint> : null}
        {move ? (
          <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ ...PIX, fontSize: 7, color: colors.textMuted }}>{mine.moves.length >= 4 ? "MUST REPLACE A MOVE" : "GOES INTO A FREE SLOT"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(move)}</span>
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
              style={{ alignSelf: "flex-start" }}
            >
              X CLEAR MOVE
            </Btn>
          </div>
        ) : null}
      </Panel>

      {asking ? (
        <ConfirmBar
          text={move ? `Learn ${cap(move)} and go to level ${level}?` : `Update ${cap(mine.nickname ?? mine.species?.name)} to level ${level}?`}
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
