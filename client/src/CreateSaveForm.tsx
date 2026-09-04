import { useState } from "react";
import { colors, PIX, VT } from "./theme";
import { Btn, Panel, SearchInput, SectionLabel, Stepper } from "./ui";
import type { Save } from "./types";

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
    <div
      style={{
        height: "100vh",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          background: colors.navy,
          borderBottom: `3px solid ${colors.ink}`,
          boxShadow: `inset 0 -4px 0 ${colors.navyDark}`,
          padding: "16px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <img src="/pokeball.png" alt="Pokemon Copilot" style={{ width: 26, height: 26 }} />
        <div style={{ ...PIX, fontSize: 10, color: colors.white, textShadow: `2px 2px 0 ${colors.ink}` }}>
          POKEMON COPILOT
        </div>
      </div>
      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ ...VT, fontSize: 19, color: colors.textMuted }}>
          Nenhum save encontrado. Crie o primeiro pra começar a registrar Pokémon.
        </div>
        <Panel>
          <SectionLabel>NOME DO SAVE *</SectionLabel>
          <SearchInput value={name} onChange={setName} placeholder="ex: Minha run de Platinum" />
          <SectionLabel>JOGO *</SectionLabel>
          <SearchInput value={game} onChange={setGame} placeholder="ex: platinum, black, scarlet..." />
          <SectionLabel>GERAÇÃO *</SectionLabel>
          <Stepper value={generation} onChange={setGeneration} min={1} max={9} />
          {error ? <div style={{ ...VT, fontSize: 17, color: colors.red }}>{error}</div> : null}
          <Btn variant="primary" full disabled={busy} onClick={() => void submit()}>
            {busy ? "CREATING..." : "CREATE SAVE"}
          </Btn>
        </Panel>
      </div>
    </div>
  );
}
