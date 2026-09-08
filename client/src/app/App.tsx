import { useState } from "react";
import { FlashMessage } from "../components";
import { BattleTab } from "../features/battle/BattleTab";
import { CreateSaveForm } from "../features/saves/CreateSaveForm";
import { AddPage } from "../features/pokemon/pages/AddPage";
import { DetailFlow } from "../features/pokemon/pages/DetailPages";
import { PartyView, PcView, SearchView } from "../features/pokemon/PokemonTab";
import { useGenerationDex, usePc, useParty, useSaves } from "../hooks/data";
import { useBattle } from "../hooks/useBattle";
import { useFlash } from "../hooks/useFlash";
import { BottomNav, Header, Subnav } from "./Shell";
import type { GenerationSpeciesEntry } from "../types/species";
import type { Save } from "../types/saves";

type AddState = GenerationSpeciesEntry | "blank" | null;

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center font-vt text-[22px] text-white">Loading...</div>
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
    <div className="relative mx-auto flex h-screen w-full max-w-[480px] flex-col overflow-hidden border-x-[3px] border-ink bg-bg">
      <Header headerMeta={headerMeta} saves={saves} selectedSave={save} onSelectSave={onSelectSave} onCreateSave={onCreateSave} />
      {tab === "pokemons" ? <Subnav sub={sub} onChange={setSub} /> : null}
      <FlashMessage message={message} />

      <div
        className={`flex-1 ${
          tab === "pokemons" ? "overflow-y-auto px-2.5 pt-2.5 pb-[18px]" : "overflow-hidden"
        }`}
      >
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
