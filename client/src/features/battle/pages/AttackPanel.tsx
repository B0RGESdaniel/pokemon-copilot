import { useQueries } from "@tanstack/react-query";
import { getMove } from "../../../api/species";
import { queryKeys } from "../../../api/queryKeys";
import { Button } from "../../../components/ui/button";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Card } from "../../../components/ui/card";
import { SectionLabel } from "../../../components/SectionLabel";
import { TypeBadge } from "../../../components/TypeBadge";
import {
  effectivenessBadge,
  multiplierAgainst,
} from "../../../utils/effectiveness";
import type { useTypeChart } from "../../../hooks/data";
import { cap } from "../../../theme";
import type { MoveDTO } from "../../../types/species";

export function AttackPanel({
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

  const rows: (MoveDTO & { effLabel: string; effClassName: string })[] =
    moveQueries
      .map((q) => q.data)
      .filter((mv): mv is MoveDTO => !!mv)
      .map((mv) => {
        if (mv.damageClass === "status" || mv.power === null) {
          return {
            ...mv,
            effLabel: "STATUS",
            effClassName: "bg-border text-text-muted",
          };
        }
        const v = chart ? multiplierAgainst(mv.type, oppTypes, chart) : 1;
        const badge = effectivenessBadge(v);
        return { ...mv, effLabel: badge.label, effClassName: badge.className };
      });

  return (
    <PageShell title="MOVES" onBack={onClose}>
      <Card>
        <SectionLabel>
          {cap(mine.nickname ?? mine.species?.name)} MOVES
        </SectionLabel>
        <Hint>
          Reference only. Effectiveness vs{" "}
          {cap(oppTypes.join("/") || "opponent")}:
        </Hint>
        {rows.length === 0 ? (
          <Hint>This pokemon has no registered moves.</Hint>
        ) : null}
        {rows.map((m) => (
          <div
            key={m.name}
            className="flex min-h-13 items-center gap-2 border-2 border-ink bg-panel-alt p-2.5"
          >
            <span className="flex-1 font-pix text-[8px] text-text">
              {cap(m.name)}
            </span>
            <TypeBadge type={m.type} size={6} />
            <span className="font-vt text-[16px] whitespace-nowrap text-text">
              {m.power ? `PWR ${m.power}` : "—"}
            </span>
            <span
              className={`border-2 border-ink px-1.25 py-1 font-pix text-[8px] whitespace-nowrap ${m.effClassName}`}
            >
              {m.effLabel}
            </span>
          </div>
        ))}
        <Button variant="secondary" full onClick={onClose}>
          CLOSE
        </Button>
      </Card>
    </PageShell>
  );
}
