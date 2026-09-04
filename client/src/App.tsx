import { useState } from "react";
import { BattleTab } from "./BattleTab";
import { CreateSaveForm } from "./CreateSaveForm";
import { useGenerationDex, usePc, useParty, useSaves } from "./hooks/data";
import { useBattle } from "./hooks/useBattle";
import { useFlash } from "./hooks/useFlash";
import { AddPage } from "./pages/AddPage";
import { DetailFlow } from "./pages/DetailPages";
import { PartyView, PcView, SearchView } from "./PokemonTab";
import { BottomNav, Header, Subnav } from "./Shell";
import { colors } from "./theme";
import { FlashMessage } from "./ui";
import type { GenerationSpeciesEntry, Save } from "./types";

type AddState = GenerationSpeciesEntry | "blank" | null;

function LoadingScreen() {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: colors.white, fontFamily: "'VT323', monospace", fontSize: 22 }}>
      Loading...
    </div>
  );
}

function MainApp({
  save,
  saves,
  onSelectSave,
  onCreateSave,
}: {
  save: Save;
  saves: Save[];
  onSelectSave: (id: string) => void;
  onCreateSave: (input: { name: string; game: string; generation: number }) => Promise<Save>;
}) {
  const { party, reload: reloadParty } = useParty(save.id);
  const { pc, reload: reloadPc } = usePc(save.id);
  const { dex } = useGenerationDex(save.generation);
  const battle = useBattle(save.id);
  const { message, flash } = useFlash();

  const [tab, setTab] = useState<"pokemons" | "battle">("pokemons");
  const [sub, setSub] = useState<"party" | "pc" | "search">("party");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState<AddState>(null);

  const reloadAll = async () => {
    await Promise.all([reloadParty(), reloadPc()]);
  };

  const allPokemon = [...party, ...pc];
  const detailPokemon = detailId ? (allPokemon.find((p) => p.id === detailId) ?? null) : null;

  const headerMeta =
    tab === "battle" && battle.status?.status === "active" && battle.status.opponent
      ? `vs ${battle.status.opponent.species?.name.toUpperCase() ?? "?"} Lv ${battle.status.opponent.level}`
      : `${party.length}/6 party · ${pc.length} PC`;

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
        position: "relative",
        overflow: "hidden",
        borderLeft: `3px solid ${colors.ink}`,
        borderRight: `3px solid ${colors.ink}`,
      }}
    >
      <Header headerMeta={headerMeta} saves={saves} selectedSave={save} onSelectSave={onSelectSave} onCreateSave={onCreateSave} />
      {tab === "pokemons" ? <Subnav sub={sub} onChange={setSub} /> : null}
      <FlashMessage message={message} />

      <div style={{ flex: "1 1 auto", overflowY: tab === "pokemons" ? "auto" : "hidden", padding: tab === "pokemons" ? "10px 10px 18px" : 0 }}>
        {tab === "pokemons" && sub === "party" ? (
          <PartyView party={party} onOpenDetail={setDetailId} onOpenAdd={() => setAddOpen("blank")} />
        ) : null}
        {tab === "pokemons" && sub === "pc" ? (
          <PcView pc={pc} onOpenDetail={setDetailId} onOpenAdd={() => setAddOpen("blank")} />
        ) : null}
        {tab === "pokemons" && sub === "search" ? (
          <SearchView dex={dex} party={party} pc={pc} onOpenDetail={setDetailId} onOpenAdd={(entry) => setAddOpen(entry)} />
        ) : null}
        {tab === "battle" ? <BattleTab saveId={save.id} generation={save.generation} dex={dex} battle={battle} onFlash={flash} /> : null}
      </div>

      <BottomNav tab={tab} onChange={setTab} />

      {detailPokemon ? (
        <DetailFlow saveId={save.id} pokemon={detailPokemon} onBack={() => setDetailId(null)} onFlash={flash} onMutated={reloadAll} />
      ) : null}

      {addOpen ? (
        <AddPage
          saveId={save.id}
          partyFull={party.length >= 6}
          prefill={addOpen === "blank" ? null : addOpen}
          dex={dex}
          onBack={() => setAddOpen(null)}
          onDone={() => {
            setAddOpen(null);
            void reloadAll();
          }}
          onFlash={flash}
        />
      ) : null}
    </div>
  );
}

export function App() {
  const { saves, loading, selected, select, create } = useSaves();

  if (loading) return <LoadingScreen />;
  if (!saves || saves.length === 0) return <CreateSaveForm onCreate={create} />;
  if (!selected) return <LoadingScreen />;

  return <MainApp save={selected} saves={saves} onSelectSave={select} onCreateSave={create} />;
}
