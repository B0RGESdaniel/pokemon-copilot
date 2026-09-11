import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="font-pix text-[8px] text-text">{children}</div>;
}
