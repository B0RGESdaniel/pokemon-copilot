import { useState } from "react";
import { Button } from "../components/ui/button";
import { SectionLabel } from "../components/SectionLabel";
import { NewSaveInline } from "../features/saves/NewSaveInline";
import type { Save } from "../types/saves";

export function Header({
  headerMeta,
  saves,
  selectedSave,
  onSelectSave,
  onCreateSave,
  onManageSaves,
}: {
  headerMeta: string;
  saves: Save[];
  selectedSave: Save;
  onSelectSave: (id: string) => void;
  onCreateSave: (input: {
    name: string;
    game: string;
    generation: number;
  }) => Promise<Save>;
  onManageSaves: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  return (
    <div className="relative flex-none">
      <div className="flex items-center gap-2 border-b-[3px] border-ink bg-navy px-3 pt-3 pb-2.5 shadow-[inset_0_-4px_0_var(--color-navy-dark)]">
        <img
          src="/pokeball.png"
          alt="Pokemon Copilot"
          className="size-6.5 shrink-0 object-contain"
        />
        <div className="flex shrink-0 flex-col font-pix text-[8px] leading-[1.3] tracking-[1px] text-white [text-shadow:2px_2px_0_var(--color-ink)]">
          <span>POKEMON</span>
          <span>COPILOT</span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto min-w-0 truncate border-0 bg-transparent font-vt text-[8px] text-header-hint"
        >
          {headerMeta} ▾
        </button>
      </div>

      {open ? (
        <div className="absolute top-full right-2 z-10 flex w-65 flex-col gap-1.5 border-[3px] border-ink bg-panel p-2.5 shadow-[3px_3px_0_var(--color-ink)]">
          <SectionLabel>SAVES</SectionLabel>
          {saves.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectSave(s.id);
                setOpen(false);
              }}
              className={`border-2 border-ink p-2 text-left font-pix text-[8px] ${
                s.id === selectedSave.id
                  ? "bg-navy text-white"
                  : "bg-panel-alt text-text"
              }`}
            >
              {s.name.toUpperCase()} · GEN {s.generation}
            </button>
          ))}
          {creating ? (
            <NewSaveInline
              onCancel={() => setCreating(false)}
              onCreate={async (input) => {
                await onCreateSave(input);
                setCreating(false);
                setOpen(false);
              }}
            />
          ) : (
            <>
              <Button
                variant="primary"
                full
                onClick={() => setCreating(true)}
                fontSize={8}
                minHeight={40}
              >
                + NEW SAVE
              </Button>
              <Button
                variant="ghost"
                className="bg-bg-alt"
                full
                onClick={() => {
                  setOpen(false);
                  onManageSaves();
                }}
                fontSize={8}
                minHeight={40}
              >
                MANAGE SAVES
              </Button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
