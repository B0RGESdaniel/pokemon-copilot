import { useState } from "react";
import { Btn, Panel, SearchInput, SectionLabel, Stepper } from "../../components";
import type { Save } from "../../types/saves";

export function CreateSaveForm({
  onCreate,
}: {
  onCreate: (input: { name: string; game: string; generation: number }) => Promise<Save>;
}) {
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [generation, setGeneration] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !game.trim()) {
      setError("Preencha nome e jogo.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCreate({ name: name.trim(), game: game.trim().toLowerCase(), generation });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen w-full max-w-[480px] flex-col bg-bg">
      <div className="flex flex-none items-center gap-2.5 border-b-[3px] border-ink bg-navy px-3 py-4 shadow-[inset_0_-4px_0_var(--color-navy-dark)]">
        <img src="/pokeball.png" alt="Pokemon Copilot" className="size-[26px]" />
        <div className="font-pix text-[10px] text-white [text-shadow:2px_2px_0_var(--color-ink)]">
          POKEMON COPILOT
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3.5">
        <div className="font-vt text-[19px] text-text-muted">
          Nenhum save encontrado. Crie o primeiro pra começar a registrar Pokémon.
        </div>
        <Panel>
          <SectionLabel>NOME DO SAVE *</SectionLabel>
          <SearchInput value={name} onChange={setName} placeholder="ex: Minha run de Platinum" />
          <SectionLabel>JOGO *</SectionLabel>
          <SearchInput value={game} onChange={setGame} placeholder="ex: platinum, black, scarlet..." />
          <SectionLabel>GERAÇÃO *</SectionLabel>
          <Stepper value={generation} onChange={setGeneration} min={1} max={9} />
          {error ? <div className="font-vt text-[17px] text-red">{error}</div> : null}
          <Btn variant="primary" full disabled={busy} onClick={() => void submit()}>
            {busy ? "CREATING..." : "CREATE SAVE"}
          </Btn>
        </Panel>
      </div>
    </div>
  );
}
