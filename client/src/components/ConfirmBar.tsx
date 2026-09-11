import { tv } from "tailwind-variants";
import { Btn } from "./Btn";
import { Hint } from "./Hint";

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
