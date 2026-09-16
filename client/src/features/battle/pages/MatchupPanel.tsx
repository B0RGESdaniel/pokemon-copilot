import { tv } from "tailwind-variants";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { SectionLabel } from "../../../components/SectionLabel";
import { Sprite } from "../../../components/Sprite";
import { TypeBadge } from "../../../components/TypeBadge";
import { useBattleSuggestions } from "../../../hooks/useBattle";
import { cap } from "../../../theme";
import { effectivenessBadge } from "../../../utils/effectiveness";

const matchupGrade = tv({
  variants: {
    tier: {
      great: "bg-green text-ink",
      good: "bg-green-soft text-ink",
      bad: "bg-red text-white",
      neutral: "bg-highlight text-text-muted",
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
      <div className="flex flex-col gap-1">
        <SectionLabel>
          MATCHUP VS <span className="text-red">{oppName}</span>
        </SectionLabel>
        <Hint>Best to worst matchup. Tap to send out.</Hint>
      </div>

      <div className="flex flex-col gap-2">
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
          const atkBadge = effectivenessBadge(r.matchup.offensiveMultiplier);
          const defBadge = effectivenessBadge(r.matchup.defensiveMultiplier);

          return (
            <button
              key={r.pokemon.id}
              onClick={() => (active ? undefined : void onPick(r.pokemon.id))}
              className={`flex w-full flex-col gap-2 rounded-base border-[3px] p-2.5 text-left ${
                active
                  ? "border-blue bg-blue-soft shadow-[inset_0_3px_0_var(--color-blue-softer)]"
                  : "border-ink bg-panel shadow-[3px_3px_0_var(--color-ink)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-13.5 flex-none items-center justify-center rounded-base border-2 border-ink bg-frame">
                  <Sprite
                    url={r.pokemon.species?.sprite}
                    size={46}
                    alt={r.pokemon.nickname ?? undefined}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="font-pix text-[8px] wrap-break-word text-text">
                    {i + 1}.{" "}
                    {r.pokemon.nickname ?? cap(r.pokemon.species?.name)}
                  </div>
                  <div className="font-vt text-[15px] text-text-muted">
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
                <span
                  className={`flex-none rounded-base border-2 border-ink px-1.5 py-1 font-pix text-[8px] whitespace-nowrap ${grade.className}`}
                >
                  {grade.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 border-t-2 border-frame-alt pt-2">
                <span className="font-pix text-[8px] text-text-muted">
                  ATK
                </span>
                <span
                  className={`rounded-base border-2 border-ink px-1.25 py-0.75 font-pix text-[8px] ${atkBadge.className}`}
                >
                  {atkBadge.label}
                </span>
                <span className="ml-2 font-pix text-[8px] text-text-muted">
                  DEF
                </span>
                <span
                  className={`rounded-base border-2 border-ink px-1.25 py-0.75 font-pix text-[8px] ${defBadge.className}`}
                >
                  {defBadge.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}
