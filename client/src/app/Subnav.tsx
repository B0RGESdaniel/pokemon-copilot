import { tv } from "tailwind-variants";

const subnavTab = tv({
  base: "min-h-11 flex-1 border-2 border-ink font-pix text-[8px]",
  variants: {
    active: {
      true: "bg-navy text-white shadow-[inset_0_2px_0_var(--color-navy-light)]",
      false: "bg-[#b8c1d2] text-[#7a8598] shadow-[inset_0_2px_0_#c7cfdd]",
    },
  },
});

export function Subnav({
  sub,
  onChange,
}: {
  sub: "party" | "pc" | "search";
  onChange: (s: "party" | "pc" | "search") => void;
}) {
  const tabs: { key: "party" | "pc" | "search"; label: string }[] = [
    { key: "party", label: "PARTY" },
    { key: "pc", label: "PC" },
    { key: "search", label: "SEARCH" },
  ];
  return (
    <div className="flex flex-none gap-1.5 border-b-[3px] border-ink bg-bg-alt p-2">
      {tabs.map((t) => {
        const active = sub === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={subnavTab({ active })}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
