import { Minus, Plus } from "pixelarticons/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
      <Button
        variant="secondary"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-13 w-13 p-0"
      >
        <Minus className="size-4 text-ink" />
      </Button>
      <Input
        value={String(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
          onChange(digits === "" ? min : Math.min(max, Number(digits)));
        }}
        inputMode="numeric"
        className="min-w-0 flex-[1_1_auto] p-2 text-center text-[24px]"
      />
      <Button
        variant="secondary"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-13 w-13 p-0"
      >
        <Plus className="size-4 text-ink" />
      </Button>
    </div>
  );
}
