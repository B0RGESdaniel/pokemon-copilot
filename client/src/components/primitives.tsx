import type { ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const panel = tv({
  base: "flex flex-col gap-2 border-[3px] border-ink bg-panel p-2.5 shadow-[3px_3px_0_var(--color-ink)]",
});

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={panel({ className })}>{children}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="font-pix text-[9px] text-text">{children}</div>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <div className="font-vt text-[18px] text-text-muted">{children}</div>;
}

const btn = tv({
  base: "font-pix px-3 py-2",
  variants: {
    variant: {
      primary:
        "border-[3px] border-ink bg-blue text-white shadow-[inset_0_3px_0_var(--color-blue-light),3px_3px_0_var(--color-ink)] [text-shadow:1px_1px_0_var(--color-ink)]",
      secondary:
        "border-[3px] border-ink bg-blue-soft text-ink shadow-[inset_0_3px_0_var(--color-blue-softer),3px_3px_0_var(--color-ink)]",
      danger: "border-2 border-ink bg-red text-white [text-shadow:1px_1px_0_var(--color-ink)]",
      outlineDanger: "border-[3px] border-red bg-bg text-red shadow-[3px_3px_0_var(--color-ink)]",
      ghost: "border-2 border-ink bg-panel text-ink",
    },
    fontSize: {
      7: "text-[7px]",
      8: "text-[8px]",
      9: "text-[9px]",
      12: "text-[12px]",
    },
    minHeight: {
      36: "min-h-9",
      40: "min-h-10",
      42: "min-h-[42px]",
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
      className={btn({ variant, fontSize, minHeight, full, disabled, className })}
    >
      {children}
    </button>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-2 border-ink bg-white p-[11px] text-[21px] text-ink"
    />
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 100,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-13 w-13 border-2 border-ink bg-blue-soft text-[12px] text-ink shadow-[inset_0_3px_0_var(--color-blue-softer)]"
      >
        -
      </button>
      <input
        value={String(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
          onChange(digits === "" ? min : Math.min(max, Number(digits)));
        }}
        inputMode="numeric"
        className="min-w-0 flex-[1_1_auto] border-2 border-ink bg-white p-2 text-center text-[26px] text-ink"
      />
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-13 w-13 border-2 border-ink bg-blue-soft text-[12px] text-ink shadow-[inset_0_3px_0_var(--color-blue-softer)]"
      >
        +
      </button>
    </div>
  );
}

const confirmBar = tv({
  base: "flex flex-col gap-2.5 border-[3px] p-2.5",
  variants: {
    danger: {
      true: "border-red bg-red-soft",
      false: "border-ink bg-panel-alt",
    },
  },
  defaultVariants: {
    danger: false,
  },
});

export function ConfirmBar({
  text,
  confirmLabel,
  onCancel,
  onConfirm,
  danger,
}: {
  text: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean;
}) {
  return (
    <div className={confirmBar({ danger })}>
      <Hint>{text}</Hint>
      <div className="flex gap-2">
        <Btn variant="ghost" full onClick={onCancel}>
          CANCEL
        </Btn>
        <Btn variant={danger ? "danger" : "primary"} full onClick={onConfirm}>
          {confirmLabel}
        </Btn>
      </div>
    </div>
  );
}
