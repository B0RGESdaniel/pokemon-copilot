import type { ReactNode } from "react";

export function Hint({ children }: { children: ReactNode }) {
  return <div className="font-vt text-[13px] text-text-muted">{children}</div>;
}
