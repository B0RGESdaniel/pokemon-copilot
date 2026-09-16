import { useState } from "react";
import { useUpdatePokemon } from "../../../hooks/usePokemonMutations";
import { useSearchItems } from "../../../hooks/useSpecies";
import { Button } from "../../../components/ui/button";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Card } from "../../../components/ui/card";
import { SearchInput } from "../../../components/SearchInput";
import { SectionLabel } from "../../../components/SectionLabel";
import { cap } from "../../../theme";
import type { PokemonDTO } from "../../../types/pokemon";

export function ItemPage({
  pokemon,
  onBack,
  onFlash,
}: {
  pokemon: PokemonDTO;
  onBack: () => void;
  onFlash: (msg: string) => void;
}) {
  const [query, setQuery] = useState("");
  const choices = useSearchItems(query);
  const updatePokemon = useUpdatePokemon();

  const pick = async (item: string) => {
    await updatePokemon.mutateAsync({
      id: pokemon.id,
      input: { heldItem: item },
    });
    onFlash(`${cap(item)} equipped.`);
    onBack();
  };

  const remove = async () => {
    await updatePokemon.mutateAsync({
      id: pokemon.id,
      input: { heldItem: null },
    });
    onFlash("Item removed.");
  };

  return (
    <PageShell title="HELD ITEM" onBack={onBack}>
      <Card>
        <SectionLabel>CURRENT ITEM</SectionLabel>
        <div className="flex min-h-11.5 items-center gap-2 border-2 border-ink bg-panel-alt p-2.5">
          <span className="flex-1 font-pix text-[16px] text-text">
            {pokemon.heldItem ? cap(pokemon.heldItem) : "NONE"}
          </span>
          {pokemon.heldItem ? (
            <Button
              variant="danger"
              onClick={() => void remove()}
              minHeight={40}
              fontSize={8}
            >
              REMOVE
            </Button>
          ) : null}
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="search item..."
        />
        {choices.length > 0 ? (
          <div className="flex max-h-57.5 flex-col overflow-y-auto border-2 border-ink bg-panel-alt">
            {choices.map((it) => (
              <button
                key={it}
                onClick={() => void pick(it)}
                className={`flex min-h-11.5 items-center border-0 border-b-2 border-frame-alt p-2.5 text-left font-pix text-[8px] text-text ${
                  pokemon.heldItem === it ? "bg-yellow" : "bg-panel"
                }`}
              >
                {cap(it)}
              </button>
            ))}
          </div>
        ) : !query.trim() ? (
          <Hint>Type to search for an item.</Hint>
        ) : null}
      </Card>
    </PageShell>
  );
}
