import { useState } from "react";
import { ChevronDown } from "pixelarticons/react";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { SectionLabel } from "../components/SectionLabel";
import { NewSaveDialog } from "../features/saves/NewSaveDialog";
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
      <div className="flex items-center gap-2 border-b-[3px] border-ink bg-navy px-3 pt-3.5 pb-3 shadow-[inset_0_-4px_0_var(--color-navy-dark)]">
        <img
          src="/pokemon-copilot-logo.svg"
          alt="Pokemon Copilot"
          className="size-8 shrink-0 object-contain"
        />
        <div className="flex shrink-0 flex-col font-vt text-[13px] leading-[1.2] tracking-[1px] text-white [text-shadow:2px_2px_0_var(--color-ink)]">
          <span>POKEMON</span>
          <span>COPILOT</span>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="ml-auto flex min-w-0 items-center gap-1 border-0 bg-transparent font-vt text-[14px] text-header-hint">
            <span className="min-w-0 truncate">{headerMeta}</span>
            <ChevronDown className="size-3.5 shrink-0 text-header-hint" />
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <SectionLabel>SAVES</SectionLabel>
            {saves.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSelectSave(s.id);
                  setOpen(false);
                }}
                className={`rounded-base border-2 border-ink p-2.5 text-left font-vt text-[13px] ${
                  s.id === selectedSave.id
                    ? "bg-navy text-white"
                    : "bg-panel-alt text-text"
                }`}
              >
                {s.name.toUpperCase()} · GEN {s.generation}
              </button>
            ))}
            <Button
              variant="primary"
              full
              onClick={() => {
                setOpen(false);
                setCreating(true);
              }}
              fontSize={8}
              minHeight={44}
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
              minHeight={44}
            >
              MANAGE SAVES
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <NewSaveDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={async (input) => {
          await onCreateSave(input);
          setCreating(false);
        }}
      />
    </div>
  );
}
