import type { ReactNode } from "react";
import { ChevronLeft } from "pixelarticons/react";
import { Button } from "./ui/button";

export function PageShell({
  title,
  onBack,
  children,
  insetTop = true,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
  // False for panels nested inside another screen's own content area (e.g.
  // BattleTab's AttackPanel/OpponentPanel/MatchupPanel/LevelUpPanel) — their
  // `absolute inset-0` only spans that parent's content box, not the full
  // app shell, and the outer Header stays visible above them. Adding the top
  // safe-area padding there would double-reserve space Header already did.
  insetTop?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <div
        className={`flex flex-none items-center gap-2.5 border-b-[3px] border-ink bg-navy px-2.5 pb-2 shadow-[inset_0_-4px_0_var(--color-navy-dark)] ${
          insetTop ? "pt-[calc(0.625rem+env(safe-area-inset-top))]" : "pt-2"
        }`}
      >
        <Button
          variant="secondary"
          onClick={onBack}
          minHeight={44}
          fontSize={8}
          className="gap-1.5 py-2"
        >
          <ChevronLeft className="size-3.5 text-ink" />
          BACK
        </Button>
        <div className="ml-auto text-right font-vt text-[13px] text-white [text-shadow:2px_2px_0_var(--color-ink)]">
          {title}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pt-2.5 pb-[calc(1.375rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}
