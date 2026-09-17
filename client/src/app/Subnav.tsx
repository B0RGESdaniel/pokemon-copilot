import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

// Same retro border/shadow/press language as app/BottomNav.tsx's tabClass,
// kept on this component's own colors (light-grey inactive, navy active)
// instead of BottomNav's navy-dark/blue pair.
const tabClass =
  "min-h-12 flex-1 rounded-base border-[3px] border-ink bg-[#b8c1d2] font-vt text-[16px] text-[#7a8598] shadow-[inset_0_3px_0_#c7cfdd,0_3px_0_var(--color-ink)] transition-[transform,box-shadow] duration-500 active:translate-y-boxShadowY active:shadow-none data-active:bg-navy data-active:text-white data-active:shadow-[inset_0_3px_0_var(--color-navy-light),0_3px_0_var(--color-ink)] data-active:[text-shadow:2px_2px_0_var(--color-ink)]";

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
    <div className="flex-none border-b-[3px] border-ink bg-bg-alt p-2.5">
      <Tabs
        value={sub}
        onValueChange={(v) => onChange(v as "party" | "pc" | "search")}
      >
        <TabsList className="gap-2">
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className={tabClass}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
