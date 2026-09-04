import { useState } from "react";
import type { Save } from "./types";
import { colors, PIX } from "./theme";
import { Btn, SearchInput, SectionLabel, Stepper } from "./ui";

export function Header({
  headerMeta,
  saves,
  selectedSave,
  onSelectSave,
  onCreateSave,
}: {
  headerMeta: string;
  saves: Save[];
  selectedSave: Save;
  onSelectSave: (id: string) => void;
  onCreateSave: (input: { name: string; game: string; generation: number }) => Promise<Save>;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  return (
    <div style={{ position: "relative", flex: "0 0 auto" }}>
      <div
        style={{
          background: colors.navy,
          borderBottom: `3px solid ${colors.ink}`,
          boxShadow: `inset 0 -4px 0 ${colors.navyDark}`,
          padding: "12px 12px 10px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <img
          src="/pokeball.png"
          alt="Pokemon Copilot"
          style={{ width: 26, height: 26, flex: "0 0 26px", objectFit: "contain" }}
        />
        <div style={{ ...PIX, fontSize: 10, color: colors.white, textShadow: `2px 2px 0 ${colors.ink}`, letterSpacing: 1 }}>
          POKEMON COPILOT
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            fontFamily: "'VT323', monospace",
            fontSize: 17,
            color: colors.headerHint,
            cursor: "pointer",
          }}
        >
          {headerMeta} ▾
        </button>
      </div>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 8,
            zIndex: 10,
            width: 260,
            border: `3px solid ${colors.ink}`,
            background: colors.panel,
            boxShadow: `3px 3px 0 ${colors.ink}`,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <SectionLabel>SAVES</SectionLabel>
          {saves.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectSave(s.id);
                setOpen(false);
              }}
              style={{
                ...PIX,
                fontSize: 8,
                textAlign: "left",
                padding: 8,
                border: `2px solid ${colors.ink}`,
                background: s.id === selectedSave.id ? colors.navy : colors.panelAlt,
                color: s.id === selectedSave.id ? colors.white : colors.text,
              }}
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
            <Btn variant="primary" full onClick={() => setCreating(true)} fontSize={8} minHeight={40}>
              + NEW SAVE
            </Btn>
          )}
        </div>
      ) : null}
    </div>
  );
}

function NewSaveInline({
  onCreate,
  onCancel,
}: {
  onCreate: (input: { name: string; game: string; generation: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [generation, setGeneration] = useState(4);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: `2px solid ${colors.frameAlt}`, paddingTop: 6 }}>
      <SearchInput value={name} onChange={setName} placeholder="save name" />
      <SearchInput value={game} onChange={setGame} placeholder="game (ex: platinum)" />
      <Stepper value={generation} onChange={setGeneration} min={1} max={9} />
      <div style={{ display: "flex", gap: 6 }}>
        <Btn variant="ghost" full fontSize={7} minHeight={36} onClick={onCancel}>
          CANCEL
        </Btn>
        <Btn
          variant="primary"
          full
          fontSize={7}
          minHeight={36}
          onClick={() => void onCreate({ name, game: game.toLowerCase(), generation })}
        >
          CREATE
        </Btn>
      </div>
    </div>
  );
}

export function Subnav({ sub, onChange }: { sub: "party" | "pc" | "search"; onChange: (s: "party" | "pc" | "search") => void }) {
  const tabs: { key: "party" | "pc" | "search"; label: string }[] = [
    { key: "party", label: "PARTY" },
    { key: "pc", label: "PC" },
    { key: "search", label: "SEARCH" },
  ];
  return (
    <div style={{ flex: "0 0 auto", background: colors.bgAlt, borderBottom: `3px solid ${colors.ink}`, padding: 8, display: "flex", gap: 6 }}>
      {tabs.map((t) => {
        const active = sub === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              flex: "1 1 0",
              minHeight: 44,
              fontSize: 8,
              fontFamily: "'Press Start 2P', monospace",
              border: `2px solid ${colors.ink}`,
              background: active ? colors.navy : "#b8c1d2",
              color: active ? colors.white : "#7a8598",
              boxShadow: `inset 0 2px 0 ${active ? colors.navyLight : "#c7cfdd"}`,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function BottomNav({ tab, onChange }: { tab: "pokemons" | "battle"; onChange: (t: "pokemons" | "battle") => void }) {
  const isPokemons = tab === "pokemons";
  return (
    <div style={{ flex: "0 0 auto", background: colors.navyDark, borderTop: `3px solid ${colors.ink}`, display: "flex" }}>
      <button
        onClick={() => onChange("pokemons")}
        style={{
          flex: "1 1 0",
          minHeight: 64,
          border: "none",
          borderRight: `3px solid ${colors.ink}`,
          background: isPokemons ? colors.blue : colors.navyDark,
          color: isPokemons ? colors.white : colors.navInactive,
          fontSize: 9,
          fontFamily: "'Press Start 2P', monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <span style={{ width: 12, height: 12, background: isPokemons ? colors.white : colors.navInactive, border: `2px solid ${colors.ink}` }} />
        POKEMON
      </button>
      <button
        onClick={() => onChange("battle")}
        style={{
          flex: "1 1 0",
          minHeight: 64,
          border: "none",
          background: !isPokemons ? colors.blue : colors.navyDark,
          color: !isPokemons ? colors.white : colors.navInactive,
          fontSize: 9,
          fontFamily: "'Press Start 2P', monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <span style={{ width: 12, height: 12, background: !isPokemons ? colors.white : colors.navInactive, border: `2px solid ${colors.ink}` }} />
        BATTLE
      </button>
    </div>
  );
}
