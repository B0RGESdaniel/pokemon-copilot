import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

const panel = tv({
  base: "flex flex-col gap-2 border-[3px] border-ink bg-panel p-2.5 shadow-[3px_3px_0_var(--color-ink)]",
});

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={panel({ className })}>{children}</div>;
}
