import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "pixelarticons/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 items-center gap-2 text-left", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        // `!` overrides needed because this renders as a <button>, and index.css's
        // bare `button { font-family: font-pix }` rule is unlayered — it beats any
        // Tailwind utility (including .font-vt) on specificity alone, since
        // Tailwind's utilities live inside @layer and unlayered CSS always wins.
        "flex w-full items-center justify-between gap-2 rounded-base border-2 border-ink bg-white p-2.75 font-vt! text-[14px] text-ink antialiased! focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="shrink-0">
        <ChevronDown className="size-3.5 text-text-faint" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignItemWithTrigger = false,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof SelectPrimitive.Positioner>,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "max-h-[min(20rem,var(--available-height))] min-w-(--anchor-width) overflow-y-auto rounded-base border-[3px] border-ink bg-panel p-1 shadow-shadow outline-none",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List data-slot="select-list">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-8 pl-2 font-vt text-[14px] text-ink outline-none select-none data-highlighted:border-ink data-highlighted:bg-blue-soft data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText
        data-slot="select-item-text"
        className="flex flex-1 items-center gap-2 whitespace-nowrap"
      >
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center"
      >
        <Check className="size-3 text-ink" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
