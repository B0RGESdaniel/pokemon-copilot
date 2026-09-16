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
        className="h-13 w-13 rounded-base border-2 border-ink bg-blue-soft text-[16px] text-ink shadow-[inset_0_3px_0_var(--color-blue-softer)]"
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
        className="min-w-0 flex-[1_1_auto] rounded-base border-2 border-ink bg-white p-2 text-center text-[24px] text-ink"
      />
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-13 w-13 rounded-base border-2 border-ink bg-blue-soft text-[16px] text-ink shadow-[inset_0_3px_0_var(--color-blue-softer)]"
      >
        +
      </button>
    </div>
  );
}
