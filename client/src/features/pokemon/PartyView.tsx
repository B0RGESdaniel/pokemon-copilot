import { Btn } from "../../components/Btn";
import { Icon } from "../../components/Icon";
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
        className="flex min-h-16 items-center gap-2 border-[3px] border-ink bg-slot-empty p-2 text-left shadow-[inset_0_3px_0_var(--color-highlight),3px_3px_0_var(--color-ink)]"
      >
        <div className="flex size-12 flex-none items-center justify-center border-2 border-ink bg-frame">
          <span className="font-pix text-[16px] text-text-dim">+</span>
        </div>
        <div className="font-pix text-[8px] text-text-faint">SLOT {slot}</div>
      </button>
    );
  }

  const types = pokemon.species?.types ?? [];
  return (
    <button
      onClick={onClick}
      className="flex min-h-16 items-center gap-2 border-[3px] border-ink bg-panel p-2 text-left shadow-[inset_0_3px_0_#ffffff,3px_3px_0_var(--color-ink)]"
    >
      <div className="flex size-12 flex-none items-center justify-center border-2 border-ink bg-frame">
        <Sprite url={pokemon.species?.sprite} size={44} alt={nameOf(pokemon)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.75">
        <div className="font-pix text-[8px] text-blue">SLOT {slot}</div>
        <div className="font-vt text-[18px] leading-[1.4] wrap-break-word text-text">
          {nameOf(pokemon)}
        </div>
      </div>
      <div className="flex flex-none flex-col items-end gap-0.75">
        <div className="font-vt text-[15px] leading-none text-text-muted">
          Lv {pokemon.level}
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          {types.length ? (
            types.map((t) => <TypeBadge key={t} type={t} />)
          ) : (
            <TypeBadge type="unknown" />
          )}
        </div>
      </div>
    </button>
  );
}

export function PartyView({
  party,
  onOpenDetail,
  onOpenAdd,
  onOpenReorder,
}: {
  party: PokemonDTO[];
  onOpenDetail: (id: string) => void;
  onOpenAdd: () => void;
  onOpenReorder: () => void;
}) {
  const slots = Array.from({ length: 6 }, (_, i) => i + 1);
  return (
    <div className="flex flex-col gap-2">
      {party.length > 1 ? (
        <Btn variant="ghost" full fontSize={8} onClick={onOpenReorder}>
          <span className="flex items-center justify-center gap-2">
            <Icon src="/reorder-icon.svg" className="size-4 bg-ink" />
            REORDER
          </span>
        </Btn>
      ) : null}
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
