import type * as React from "react";

import { cn } from "@/lib/utils";

// No default padding/text-size/height here — every call site in this app
// has its own (search bar, dex search, stepper number field), so those stay
// per-instance overrides same as before, on top of this shared structural
// style (border/radius/focus/selection treatment).
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full rounded-base border-2 border-border bg-white text-foreground selection:bg-main selection:text-main-foreground placeholder:text-foreground/50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
