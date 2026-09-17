import type { ReactNode } from "react";
import { ChevronLeft } from "pixelarticons/react";
import { Button } from "./ui/button";

export function PageShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <div className="flex flex-none items-center gap-2.5 border-b-[3px] border-ink bg-navy px-2.5 pb-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] shadow-[inset_0_-4px_0_var(--color-navy-dark)]">
        <Button
          variant="secondary"
          onClick={onBack}
          minHeight={48}
          fontSize={8}
          className="gap-1.5 py-2.5"
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
