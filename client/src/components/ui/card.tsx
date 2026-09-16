import type * as React from "react";

import { cn } from "@/lib/utils";

// Mirrors components/Panel.tsx exactly — a flat bordered box, no
// header/footer sub-parts, since nothing in this app needs them yet.
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-2 rounded-base border-[3px] border-border bg-secondary-background p-2.5 shadow-shadow",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
