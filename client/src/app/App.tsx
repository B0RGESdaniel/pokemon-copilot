import { useState } from "react";
import { Toaster } from "../components/ui/toast";
import { BattleTab } from "../features/battle/BattleTab";
import { CreateSaveForm } from "../features/saves/CreateSaveForm";
import { AddPage } from "../features/pokemon/pages/AddPage";
import { DetailFlow } from "../features/pokemon/pages/DetailFlow";
import { PartyView } from "../features/pokemon/PartyView";
import { PcView } from "../features/pokemon/PcView";
import { ReorderPartyPage } from "../features/pokemon/pages/ReorderPartyPage";
import { SearchView } from "../features/pokemon/SearchView";
import { ManageSavesPage } from "../features/saves/pages/ManageSavesPage";
import { useGenerationDex, usePc, useParty, useSaves } from "../hooks/data";
import { useBattle } from "../hooks/useBattle";
import { useFlash } from "../hooks/useFlash";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { Subnav } from "./Subnav";
import type { GenerationSpeciesEntry } from "../types/species";
import type { Save } from "../types/saves";

type AddState = GenerationSpeciesEntry | "blank" | null;

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center font-vt text-[24px] text-white">
      Loading...
    </div>
  );
}

function MainApp({
  save,
  saves,
  onSelectSave,
  onCreateSave,
  onDeleteSave,
}: {
  save: Save;
  saves: Save[];
  onSelectSave: (id: string) => void;
  onCreateSave: (input: {
    name: string;
    game: string;
    generation: number;
  }) => Promise<Save>;
  onDeleteSave: (id: string) => Promise<void>;
}) {
  const { party } = useParty(save.id);
  const { pc } = usePc(save.id);
  const { dex } = useGenerationDex(save.generation);
  const battle = useBattle(save.id);
  const { flash } = useFlash();

  const [tab, setTab] = useState<"pokemons" | "battle">("pokemons");
  const [sub, setSub] = useState<"party" | "pc" | "search">("party");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState<AddState>(null);
  const [managingSaves, setManagingSaves] = useState(false);
  const [reordering, setReordering] = useState(false);

  const allPokemon = [...party, ...pc];
  const detailPokemon = detailId
    ? (allPokemon.find((p) => p.id === detailId) ?? null)
    : null;

  const headerMeta =
    tab === "battle" &&
    battle.status?.status === "active" &&
    battle.status.opponent
      ? `vs ${battle.status.opponent.species?.name.toUpperCase() ?? "?"} Lv ${battle.status.opponent.level}`
      : `${party.length}/6 party · ${pc.length} PC`;

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-120 flex-col overflow-hidden border-x-[3px] border-ink bg-bg">
      <Header
        headerMeta={headerMeta}
        saves={saves}
        selectedSave={save}
        onSelectSave={onSelectSave}
        onCreateSave={onCreateSave}
        onManageSaves={() => setManagingSaves(true)}
      />
      {tab === "pokemons" ? <Subnav sub={sub} onChange={setSub} /> : null}
      <Toaster />

      <div
        className={`flex-1 ${
          tab === "pokemons"
            ? "overflow-y-auto px-2.5 pt-2.5 pb-4.5"
            : "overflow-y-auto"
        }`}
      >
        {tab === "pokemons" && sub === "party" ? (
          <PartyView
            party={party}
            onOpenDetail={setDetailId}
            onOpenAdd={() => setAddOpen("blank")}
            onOpenReorder={() => setReordering(true)}
          />
        ) : null}
        {tab === "pokemons" && sub === "pc" ? (
          <PcView
            pc={pc}
            onOpenDetail={setDetailId}
            onOpenAdd={() => setAddOpen("blank")}
          />
        ) : null}
        {tab === "pokemons" && sub === "search" ? (
          <SearchView
            dex={dex}
            party={party}
            pc={pc}
            onOpenDetail={setDetailId}
            onOpenAdd={(entry) => setAddOpen(entry)}
          />
        ) : null}
        {tab === "battle" ? (
          <BattleTab
            saveId={save.id}
            generation={save.generation}
            dex={dex}
            battle={battle}
            onFlash={flash}
          />
        ) : null}
      </div>

      <BottomNav tab={tab} onChange={setTab} />

      {detailPokemon ? (
        <DetailFlow
          saveId={save.id}
          pokemon={detailPokemon}
          onBack={() => setDetailId(null)}
          onFlash={flash}
        />
      ) : null}

      {addOpen ? (
        <AddPage
          saveId={save.id}
          partyFull={party.length >= 6}
          prefill={addOpen === "blank" ? null : addOpen}
          dex={dex}
          onBack={() => setAddOpen(null)}
          onDone={() => setAddOpen(null)}
          onFlash={flash}
        />
      ) : null}

      {reordering ? (
        <ReorderPartyPage
          saveId={save.id}
          party={party}
          onBack={() => setReordering(false)}
          onFlash={flash}
        />
      ) : null}

      {managingSaves ? (
        <ManageSavesPage
          saves={saves}
          selectedSaveId={save.id}
          onBack={() => setManagingSaves(false)}
          onCreate={onCreateSave}
          onDelete={onDeleteSave}
          onFlash={flash}
        />
      ) : null}
    </div>
  );
}

export function App() {
  const { saves, loading, selected, select, create, remove } = useSaves();

  if (loading) return <LoadingScreen />;
  if (!saves || saves.length === 0) return <CreateSaveForm onCreate={create} />;
  if (!selected) return <LoadingScreen />;

  return (
    <MainApp
      save={selected}
      saves={saves}
      onSelectSave={select}
      onCreateSave={create}
      onDeleteSave={remove}
    />
  );
}
