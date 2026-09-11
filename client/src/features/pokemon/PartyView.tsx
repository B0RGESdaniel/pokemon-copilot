import { Sprite } from "../../components/Sprite";
import { TypeBadge } from "../../components/TypeBadge";
import type { PokemonDTO } from "../../types/pokemon";

function nameOf(p: PokemonDTO): string {
  return p.nickname ?? (p.species ? p.species.name.toUpperCase() : "UNKNOWN");
}

function PartyCell({
  pokemon,
  slot,
  onClick,
}: {
  pokemon: PokemonDTO | undefined;
  slot: number;
  onClick: () => void;
}) {
  if (!pokemon) {
    return (
      <button
        onClick={onClick}
        className="flex min-h-33 flex-col gap-1.5 border-[3px] border-ink bg-slot-empty p-2 text-left shadow-[inset_0_3px_0_var(--color-border),3px_3px_0_var(--color-ink)]"
      >
        <div className="font-pix text-[8px] text-text-faint">SLOT {slot}</div>
        <div className="flex flex-1 items-center justify-center">
          <span className="font-pix text-[24px] text-text-dim">+</span>
        </div>
      </button>
    );
  }

  const types = pokemon.species?.types ?? [];
  return (
    <button
      onClick={onClick}
      className="flex min-h-33 flex-col gap-1.5 border-[3px] border-ink bg-panel p-2 text-left shadow-[inset_0_3px_0_#ffffff,3px_3px_0_var(--color-ink)]"
    >
      <div className="font-pix text-[8px] text-blue">SLOT {slot}</div>
      <div className="flex flex-1 items-center gap-1.75">
        <div className="flex size-19 flex-none items-center justify-center border-2 border-ink bg-frame">
          <Sprite
            url={pokemon.species?.sprite}
            size={68}
            alt={nameOf(pokemon)}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.25">
          <div className="font-pix text-[8px] leading-[1.4] wrap-break-word text-text">
            {nameOf(pokemon)}
          </div>
          <div className="font-vt text-[16px] leading-none text-text-muted">
            Lv {pokemon.level}
          </div>
          <div className="flex flex-col items-start gap-0.75">
            {types.length ? (
              types.map((t) => <TypeBadge key={t} type={t} />)
            ) : (
              <TypeBadge type="unknown" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function PartyView({
  party,
  onOpenDetail,
  onOpenAdd,
}: {
  party: PokemonDTO[];
  onOpenDetail: (id: string) => void;
  onOpenAdd: () => void;
}) {
  const slots = Array.from({ length: 6 }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot) => {
        const found = party.find((p) => p.slotPosition === slot);
        return (
          <PartyCell
            key={slot}
            pokemon={found}
            slot={slot}
            onClick={() => (found ? onOpenDetail(found.id) : onOpenAdd())}
          />
        );
      })}
    </div>
  );
}
