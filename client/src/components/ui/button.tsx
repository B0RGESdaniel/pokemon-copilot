import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

// Variant names/values mirror components/Btn.tsx (tailwind-variants) so call
// sites migrate with a straight import swap. Restyled to reuse this app's
// pixel-art tokens instead of the library's own default theme.
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-base px-3 py-2 font-base transition-[opacity,transform,box-shadow] duration-500 active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-[3px] border-border bg-main text-main-foreground shadow-[inset_0_3px_0_var(--color-blue-light),3px_3px_0_var(--color-ink)] [text-shadow:1px_1px_0_var(--color-ink)]",
        secondary:
          "border-[3px] border-border bg-blue-soft text-foreground shadow-[inset_0_3px_0_var(--color-blue-softer),3px_3px_0_var(--color-ink)]",
        danger:
          "border-2 border-border bg-red text-white shadow-shadow [text-shadow:1px_1px_0_var(--color-ink)]",
        outlineDanger:
          "border-[3px] border-red bg-background text-red shadow-shadow",
        ghost:
          "border-2 border-border bg-secondary-background text-foreground shadow-shadow",
      },
      fontSize: {
        7: "text-[7px]",
        8: "text-[8px]",
        9: "text-[9px]",
        12: "text-[12px]",
        16: "text-[16px]",
      },
      minHeight: {
        36: "min-h-9",
        40: "min-h-10",
        42: "min-h-10.5",
        44: "min-h-11",
        48: "min-h-12",
      },
      full: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "secondary",
      fontSize: 9,
      minHeight: 48,
      full: false,
    },
  },
);

type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant,
  fontSize,
  minHeight,
  full,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant, fontSize, minHeight, full, className }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
