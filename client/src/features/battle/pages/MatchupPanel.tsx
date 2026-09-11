import { tv } from "tailwind-variants";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Panel } from "../../../components/Panel";
import { SectionLabel } from "../../../components/SectionLabel";
import { Sprite } from "../../../components/Sprite";
import { TypeBadge } from "../../../components/TypeBadge";
import { useBattleSuggestions } from "../../../hooks/useBattle";
import { cap } from "../../../theme";

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

export function MatchupPanel({
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
            r.matchup.score >= 1.5
              ? "great"
              : r.matchup.score > 0
                ? "good"
                : r.matchup.score < 0
                  ? "bad"
                  : "neutral";
          const grade = {
            label: {
              great: "GREAT",
              good: "GOOD",
              bad: "BAD",
              neutral: "NEUTRAL",
            }[gradeTier],
            className: matchupGrade({ tier: gradeTier }),
          };
          return (
            <button
              key={r.pokemon.id}
              onClick={() => (active ? undefined : void onPick(r.pokemon.id))}
              className={`flex min-h-17.5 w-full items-center gap-2.5 border-[3px] border-ink p-2 text-left shadow-[3px_3px_0_var(--color-ink)] ${
                active ? "bg-panel-alt" : "bg-panel"
              }`}
            >
              <div className="flex size-13.5 flex-none items-center justify-center border-2 border-ink bg-frame">
                <Sprite
                  url={r.pokemon.species?.sprite}
                  size={46}
                  alt={r.pokemon.nickname ?? undefined}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.25">
                <div className="font-pix text-[8px] text-text">
                  {i + 1}. {r.pokemon.nickname ?? cap(r.pokemon.species?.name)}
                </div>
                <div className="font-vt text-[16px] text-text-muted">
                  Lv {r.pokemon.level}{" "}
                  {active
                    ? "· ON FIELD"
                    : `· slot ${r.pokemon.slotPosition ?? "-"}`}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(r.pokemon.species?.types ?? []).map((t) => (
                    <TypeBadge key={t} type={t} size={6} />
                  ))}
                </div>
              </div>
              <div className="flex flex-none flex-col items-end gap-1">
                <span
                  className={`border-2 border-ink px-1.25 py-1 font-vt text-[8px] ${grade.className}`}
                >
                  {grade.label}
                </span>
                <span className="font-vt text-[16px] text-text-muted">
                  deals x{r.matchup.offensiveMultiplier} / takes x
                  {r.matchup.defensiveMultiplier}
                </span>
              </div>
            </button>
          );
        })}
      </Panel>
    </PageShell>
  );
}
