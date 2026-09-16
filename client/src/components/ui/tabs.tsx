import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={cn("w-full", className)} {...props} />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex gap-1.5", className)}
      {...props}
    />
  );
}

// Boxed/pressed tab style mirroring app/Subnav.tsx's previous tv() variants —
// active state driven by Base UI's data-active attribute instead of a prop.
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "min-h-11 flex-1 rounded-base border-2 border-border bg-[#b8c1d2] font-pix text-[8px] text-[#7a8598] shadow-[inset_0_2px_0_#c7cfdd] data-active:bg-navy data-active:text-white data-active:shadow-[inset_0_2px_0_var(--color-navy-light)]",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger };
