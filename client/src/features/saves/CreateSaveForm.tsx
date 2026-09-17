import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import type { Save } from "../../types/saves";
import { SaveFields } from "./SaveFields";

export function CreateSaveForm({
  onCreate,
}: {
  onCreate: (input: {
    name: string;
    game: string;
    generation: number;
  }) => Promise<Save>;
}) {
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [generation, setGeneration] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !game) {
      setError("Preencha nome, geração e jogo.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCreate({ name: name.trim(), game, generation });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-120 flex-col bg-bg">
      <div className="flex flex-none items-center gap-2.5 border-b-[3px] border-ink bg-navy px-3 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] shadow-[inset_0_-4px_0_var(--color-navy-dark)]">
        <img
          src="/pokemon-copilot-logo.svg"
          alt="Pokemon Copilot"
          className="size-6.5"
        />
        <div className="font-pix text-[8px] text-white [text-shadow:2px_2px_0_var(--color-ink)]">
          POKEMON COPILOT
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3.5 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
        <div className="font-vt text-[16px] text-text-muted">
          Nenhum save encontrado. Crie o primeiro pra começar a registrar
          Pokémon.
        </div>
        <Card>
          <SaveFields
            name={name}
            onNameChange={setName}
            game={game}
            onGameChange={setGame}
            generation={generation}
            onGenerationChange={(g) => {
              setGeneration(g);
              setGame("");
            }}
          />
          {error ? (
            <div className="font-vt text-[16px] text-red">{error}</div>
          ) : null}
          <Button
            variant="primary"
            full
            disabled={busy}
            onClick={() => void submit()}
          >
            {busy ? "CREATING..." : "CREATE SAVE"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
