import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { PageShell } from "../../../components/PageShell";
import { Card } from "../../../components/ui/card";
import { SearchInput } from "../../../components/SearchInput";
import { SectionLabel } from "../../../components/SectionLabel";
import { Sprite } from "../../../components/Sprite";
import { Stepper } from "../../../components/Stepper";
import { cap } from "../../../theme";
import type { GenerationSpeciesEntry } from "../../../types/species";

export function OpponentPanel({
  dex,
  onClose,
  onApply,
}: {
  dex: GenerationSpeciesEntry[];
  onClose: () => void;
  onApply: (pokeApiId: number, level: number) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<GenerationSpeciesEntry | null>(null);
  const [level, setLevel] = useState(20);
  const trimmedQuery = query.trim().toLowerCase();
  const results =
    picked || !trimmedQuery
      ? []
      : dex.filter((e) => e.name.includes(trimmedQuery)).slice(0, 8);

  return (
    <PageShell title="SWITCH OPPONENT" onBack={onClose}>
      <Card>
        <SectionLabel>OPPONENT SPECIES *</SectionLabel>
        <div className="flex items-center gap-2">
          <div className="flex size-13 flex-none items-center justify-center rounded-base border-2 border-ink bg-frame">
            <Sprite
              url={
                picked
                  ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${picked.pokeApiId}.png`
                  : null
              }
              size={44}
              alt="sprite"
            />
          </div>
          <div className="min-w-0 flex-1">
            <SearchInput
              value={query}
              onChange={(v) => {
                setQuery(v);
                setPicked(null);
              }}
              placeholder="search species..."
            />
          </div>
        </div>
        {results.length > 0 ? (
          <div className="flex max-h-52.5 flex-col overflow-y-auto rounded-base border-2 border-ink bg-panel-alt">
            {results.map((r) => (
              <button
                key={r.pokeApiId}
                onClick={() => {
                  setPicked(r);
                  setQuery(cap(r.name));
                }}
                className="flex min-h-12 items-center gap-2 border-0 border-b-2 border-frame-alt bg-transparent p-2 text-left"
              >
                <span className="font-pix text-[8px] text-text">
                  {cap(r.name)}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        <SectionLabel>LEVEL *</SectionLabel>
        <Stepper value={level} onChange={setLevel} />
        <Button
          variant="primary"
          full
          disabled={!picked}
          onClick={() => picked && void onApply(picked.pokeApiId, level)}
        >
          SET OPPONENT
        </Button>
      </Card>
    </PageShell>
  );
}
