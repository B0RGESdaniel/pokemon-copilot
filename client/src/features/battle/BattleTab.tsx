import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Hint } from "../../components/Hint";
import { Card } from "../../components/ui/card";
import { Sprite } from "../../components/Sprite";
import { TypeBadge } from "../../components/TypeBadge";
import type { useBattle } from "../../hooks/useBattle";
import { useTypeChart } from "../../hooks/data";
import { cap } from "../../theme";
import type { GenerationSpeciesEntry } from "../../types/species";
import { AttackPanel } from "./pages/AttackPanel";
import { OpponentPanel } from "./pages/OpponentPanel";
import { MatchupPanel } from "./pages/MatchupPanel";
import { LevelUpPanel } from "./pages/LevelUpPanel";

type ActivePanel = "attack" | "opp" | "matchup" | "levelup" | null;

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
  const [panel, setPanel] = useState<ActivePanel>(null);
  const [confirm, setConfirm] = useState<"fainted" | "flee" | null>(null);

  const status = battle.status;

  // Replays the sprite entrance animation exactly when the battlefield becomes
  // visible (not while the full-screen OpponentPanel covers it) — a plain
  // React `key` remount was tried first, but it raced against when the
  // opponent mutation's cache update actually lands relative to the panel
  // closing, so the animation sometimes started while still hidden. Toggling
  // `style.animation` with a forced reflow restarts it deterministically,
  // decoupled from that timing.
  const oppSpriteRef = useRef<HTMLDivElement>(null);
  const mineSpriteRef = useRef<HTMLDivElement>(null);
  const revealKey =
    status?.status === "active" && panel !== "opp"
      ? `${status.activePokemon.id}:${status.opponent?.pokeApiId ?? "none"}`
      : null;

  useEffect(() => {
    if (!revealKey) return;
    for (const el of [oppSpriteRef.current, mineSpriteRef.current]) {
      if (!el) continue;
      el.style.animation = "none";
      void el.offsetHeight;
      el.style.animation = "";
    }
  }, [revealKey]);

  if (!status || battle.loading) {
    return (
      <div className="p-5 font-vt text-[24px] text-text-muted">
        Loading battle...
      </div>
    );
  }

  if (status.status === "not_started") {
    return (
      <div className="p-2.5">
        <Card className="items-center text-center">
          <div className="font-pix text-[8px] text-text">NO BATTLE YET</div>
          <Hint>Start a battle to bring out your slot 1 pokemon.</Hint>
          <Button
            variant="primary"
            full
            onClick={() =>
              void battle
                .start()
                .then(() => setPanel("opp"))
                .catch((e) => onFlash(String(e.message ?? e)))
            }
          >
            START BATTLE
          </Button>
        </Card>
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
        <Card className="items-center text-center">
          <div className="font-pix text-[8px] text-text">BATTLE OVER</div>
          <Hint>{text}</Hint>
          <Button
            variant="primary"
            full
            onClick={() =>
              void battle
                .start()
                .then(() => setPanel("opp"))
                .catch((e) => onFlash(String(e.message ?? e)))
            }
          >
            FIND NEW OPPONENT
          </Button>
        </Card>
      </div>
    );
  }

  // status.status === "active"
  const mine = status.activePokemon;
  const opponent = status.opponent;
  const mineTypes = mine.species?.types ?? [];
  const oppTypes = opponent?.species?.types ?? [];
  // No official-artwork back view exists — fall back to mirroring the front
  // sprite so it at least faces the right way when back_default is missing.
  const mineBackSprite = mine.species?.backSprite;
  const mineSpriteUrl = mineBackSprite ?? mine.species?.sprite ?? null;

  return (
    <div className="relative h-full">
      <div className="flex flex-col gap-2 p-2.5">
        <div className="flex items-stretch gap-2">
          <div className="flex w-28 flex-none flex-col gap-1.5">
            <Button
              variant="outlineDanger"
              onClick={() => setConfirm("fainted")}
              className="flex-1"
              fontSize={8}
            >
              FAINTED
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPanel("opp")}
              className="flex-1"
              fontSize={8}
            >
              SWITCH
            </Button>
          </div>
          <Card className="min-w-0 flex-1">
            <div className="font-pix text-[8px] text-red">OPPONENT</div>
            <div className="flex items-baseline gap-2">
              <div className="min-w-0 flex-1 font-vt text-[16px] leading-[1.4] wrap-break-word text-text">
                {opponent ? cap(opponent.species?.name ?? "unknown") : "NONE"}
              </div>
              <div className="flex-none font-vt text-[14px] leading-none text-text-muted">
                {opponent ? `Lv ${opponent.level}` : "not set"}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {oppTypes.map((t) => (
                <TypeBadge size={8} key={t} type={t} />
              ))}
            </div>
          </Card>
        </div>

        <div className="relative h-54 overflow-hidden rounded-base border-[3px] border-ink bg-[#2d4b34] bg-[url('/battle-background.webp')] bg-cover bg-center shadow-shadow">
          <div
            ref={oppSpriteRef}
            className="absolute top-6.5 right-[16%] aspect-square w-[29%] max-w-33 animate-in slide-in-from-right fade-in duration-500"
          >
            <Sprite
              url={opponent?.species?.sprite}
              size="fill"
              alt={opponent?.species?.name ?? "opponent"}
            />
          </div>
          <div
            ref={mineSpriteRef}
            className="absolute -bottom-2.5 left-[12%] aspect-square w-[38%] max-w-38.5 animate-in slide-in-from-left fade-in duration-500"
          >
            <img
              src={mineSpriteUrl ?? undefined}
              alt={mine.nickname ?? mine.species?.name ?? "mine"}
              className={`h-full w-full object-contain object-bottom ${mineBackSprite ? "" : "-scale-x-100"}`}
            />
          </div>
          <div className="absolute right-2 bottom-1.5 font-vt text-[12px] text-white [text-shadow:1px_1px_0_var(--color-ink)]">
            reference only · no damage math
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <Card className="min-w-0 flex-1 shadow-[inset_0_3px_0_#ffffff,3px_3px_0_var(--color-ink)]">
            <div className="font-pix text-[8px] text-blue">ON FIELD</div>
            <div className="flex items-baseline gap-2">
              <div className="min-w-0 flex-1 font-vt text-[16px] leading-[1.4] wrap-break-word text-text">
                {mine.nickname ?? cap(mine.species?.name)}
              </div>
              <div className="flex-none font-vt text-[14px] leading-none text-text-muted">
                Lv {mine.level}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {mineTypes.map((t) => (
                <TypeBadge size={8} key={t} type={t} />
              ))}
            </div>
            <Button
              variant="secondary"
              full
              onClick={() => setPanel("levelup")}
              className="mt-auto"
              fontSize={8}
              minHeight={42}
            >
              LEVEL UP
            </Button>
          </Card>
          <div className="flex flex-none flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => setPanel("attack")}
              className="bg-red shadow-[inset_0_3px_0_var(--color-red-light),3px_3px_0_var(--color-ink)]"
              fontSize={8}
            >
              ATTACK
            </Button>
            <Button
              variant="primary"
              onClick={() => setPanel("matchup")}
              className="bg-green shadow-[inset_0_3px_0_var(--color-green-soft),3px_3px_0_var(--color-ink)]"
              fontSize={8}
            >
              SWITCH POKEMON
            </Button>
            <Button
              variant="primary"
              onClick={() => setConfirm("flee")}
              className="bg-blue shadow-[inset_0_3px_0_var(--color-blue-light),3px_3px_0_var(--color-ink)]"
              fontSize={8}
            >
              RUN
            </Button>
          </div>
        </div>

        <ConfirmDialog
          open={confirm !== null}
          danger
          text={
            confirm === "fainted"
              ? `Mark ${cap(opponent?.species?.name)} as fainted and end the battle? This cannot be undone.`
              : "Run and end the battle without marking anything as fainted?"
          }
          confirmLabel={confirm === "fainted" ? "YES, FAINTED" : "YES, RUN"}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            void battle.end(
              confirm === "fainted" ? "opponent_fainted" : "fled",
            );
            setConfirm(null);
          }}
        />
      </div>

      {panel === "attack" ? (
        <AttackPanel
          mine={mine}
          oppTypes={oppTypes}
          chart={chart}
          onClose={() => setPanel(null)}
        />
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
        />
      ) : null}
    </div>
  );
}
