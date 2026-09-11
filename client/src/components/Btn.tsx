import type { ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const btn = tv({
  base: "font-pix px-3 py-2",
  variants: {
    variant: {
      primary:
        "border-[3px] border-ink bg-blue text-white shadow-[inset_0_3px_0_var(--color-blue-light),3px_3px_0_var(--color-ink)] [text-shadow:1px_1px_0_var(--color-ink)]",
      secondary:
        "border-[3px] border-ink bg-blue-soft text-ink shadow-[inset_0_3px_0_var(--color-blue-softer),3px_3px_0_var(--color-ink)]",
      danger:
        "border-2 border-ink bg-red text-white [text-shadow:1px_1px_0_var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)]",
      outlineDanger:
        "border-[3px] border-red bg-bg text-red shadow-[3px_3px_0_var(--color-ink)]",
      ghost:
        "border-2 border-ink bg-panel text-ink shadow-[3px_3px_0_var(--color-ink)]",
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
    disabled: {
      true: "opacity-50",
      false: "opacity-100",
    },
  },
  defaultVariants: {
    variant: "secondary",
    fontSize: 9,
    minHeight: 48,
    full: false,
    disabled: false,
  },
});

type BtnVariants = VariantProps<typeof btn>;

export function Btn({
  children,
  onClick,
  variant,
  full,
  disabled,
  className,
  fontSize,
  minHeight,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
} & BtnVariants) {
  return (
    <button
      onClick={onClick}
      disabled={disabled ?? false}
      className={btn({
        variant,
        fontSize,
        minHeight,
        full,
        disabled,
        className,
      })}
    >
      {children}
    </button>
  );
}
