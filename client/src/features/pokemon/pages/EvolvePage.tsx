import { useUpdatePokemon } from "../../../hooks/usePokemonMutations";
import { Hint } from "../../../components/Hint";
import { PageShell } from "../../../components/PageShell";
import { Card } from "../../../components/ui/card";
import { SectionLabel } from "../../../components/SectionLabel";
import { Sprite } from "../../../components/Sprite";
import { cap } from "../../../theme";
import type { PokemonDTO } from "../../../types/pokemon";
import type { EvolutionOption } from "../../../types/species";

export function EvolvePage({
  pokemon,
  evolutions,
  onBack,
  onFlash,
}: {
  pokemon: PokemonDTO;
  evolutions: EvolutionOption[];
  onBack: () => void;
  onFlash: (msg: string) => void;
}) {
  const updatePokemon = useUpdatePokemon();

  const pick = async (option: EvolutionOption) => {
    try {
      await updatePokemon.mutateAsync({
        id: pokemon.id,
        input: { pokeApiId: option.pokeApiId },
      });
      onFlash(
        `${cap(pokemon.species?.name)} evolved into ${cap(option.name)}!`,
      );
      onBack();
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to evolve.");
    }
  };

  return (
    <PageShell title="EVOLVE" onBack={onBack}>
      <Card>
        <SectionLabel>POSSIBLE EVOLUTIONS</SectionLabel>
        <Hint>
          {evolutions.length > 1
            ? "This species has several paths. Pick one."
            : "Tap a card to confirm the evolution."}
        </Hint>
        <div className="grid grid-cols-2 gap-2">
          {evolutions.map((o) => (
            <button
              key={o.pokeApiId}
              onClick={() => void pick(o)}
              className="flex min-h-38.5 flex-col items-center gap-1.5 border-[3px] border-ink bg-panel p-2 text-center shadow-[inset_0_3px_0_#ffffff,3px_3px_0_var(--color-ink)]"
            >
              <div className="flex size-18 items-center justify-center border-2 border-ink bg-frame">
                <Sprite
                  url={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${o.pokeApiId}.png`}
                  size={64}
                  alt={o.name}
                />
              </div>
              <div className="font-pix text-[8px] text-text">{cap(o.name)}</div>
              <div className="font-pix text-[16px] leading-[1.1] text-text-muted">
                {o.method}
              </div>
            </button>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
