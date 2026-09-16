import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../../../components/ui/button";
import { Hint } from "../../../components/Hint";
import { Icon } from "../../../components/Icon";
import { PageShell } from "../../../components/PageShell";
import { Sprite } from "../../../components/Sprite";
import { TypeBadge } from "../../../components/TypeBadge";
import { useReorderParty } from "../../../hooks/data";
import type { PokemonDTO } from "../../../types/pokemon";

function nameOf(p: PokemonDTO): string {
  return p.nickname ?? (p.species ? p.species.name.toUpperCase() : "UNKNOWN");
}

function SortableRow({ pokemon, slot }: { pokemon: PokemonDTO; slot: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pokemon.id });
  const types = pokemon.species?.types ?? [];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex min-h-16 items-center gap-2 rounded-base border-[3px] border-ink bg-panel p-2 shadow-[inset_0_3px_0_#ffffff,3px_3px_0_var(--color-ink)] ${
        isDragging ? "relative z-10 opacity-70" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Drag ${nameOf(pokemon)}`}
        className="flex size-11.5 flex-none touch-none items-center justify-center rounded-base border-2 border-ink bg-frame"
      >
        <Icon src="/drag-handle-icon.svg" className="size-5 bg-text-dim" />
      </button>
      <div className="flex size-12 flex-none items-center justify-center rounded-base border-2 border-ink bg-frame">
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
    </div>
  );
}

export function ReorderPartyPage({
  saveId,
  party,
  onBack,
  onFlash,
}: {
  saveId: string;
  party: PokemonDTO[];
  onBack: () => void;
  onFlash: (msg: string) => void;
}) {
  const sortedByCurrentSlot = [...party].sort(
    (a, b) => (a.slotPosition ?? 0) - (b.slotPosition ?? 0),
  );
  const [initialIds] = useState(() => sortedByCurrentSlot.map((p) => p.id));
  const [order, setOrder] = useState<PokemonDTO[]>(sortedByCurrentSlot);
  const [saving, setSaving] = useState(false);
  const reorderParty = useReorderParty(saveId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const dirty = order.some((p, i) => p.id !== initialIds[i]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrder((items) => {
      const oldIndex = items.findIndex((p) => p.id === active.id);
      const newIndex = items.findIndex((p) => p.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await reorderParty(order.map((p) => p.id));
      onFlash("Party order saved.");
      onBack();
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to save order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="REORDER PARTY" onBack={onBack}>
      <Hint>Drag by the handle to reorder your party, then save.</Hint>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={order.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {order.map((p, i) => (
              <SortableRow key={p.id} pokemon={p} slot={i + 1} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button
        variant="primary"
        full
        disabled={!dirty || saving}
        onClick={() => void save()}
      >
        {saving ? "SAVING..." : "SAVE ORDER"}
      </Button>
    </PageShell>
  );
}
