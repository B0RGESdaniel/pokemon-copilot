import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

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
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
