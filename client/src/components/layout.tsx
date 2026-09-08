import type { ReactNode } from "react";
import { Btn } from "./primitives";

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
      <div className="flex flex-none items-center gap-2.5 border-b-[3px] border-ink bg-navy p-2.5 shadow-[inset_0_-4px_0_var(--color-navy-dark)]">
        <Btn variant="secondary" onClick={onBack} minHeight={44} fontSize={8} className="py-2.5">
          &lt; BACK
        </Btn>
        <div className="ml-auto text-right font-pix text-[8px] text-white [text-shadow:2px_2px_0_var(--color-ink)]">
          {title}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pt-2.5 pb-[22px]">{children}</div>
    </div>
  );
}

export function FlashMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex-none border-b-[3px] border-ink bg-[#f5e6a8] px-3 py-2 font-vt text-[19px] text-navy">
      &gt; {message}
    </div>
  );
}
