import { useEffect, useState } from "react";
import { addToParty, addToPc, getLegalMoves, getSpecies, searchItems } from "../api";
import { colors, PIX, VT, cap } from "../theme";
import { Btn, Hint, PageShell, Panel, SearchInput, SectionLabel, Sprite, Stepper } from "../ui";
import type { GenerationSpeciesEntry, SpeciesDTO } from "../types";

export function AddPage({
  saveId,
  partyFull,
  prefill,
  onBack,
  onDone,
  onFlash,
  dex,
}: {
  saveId: string;
  partyFull: boolean;
  prefill: GenerationSpeciesEntry | null;
  onBack: () => void;
  onDone: () => void;
  onFlash: (msg: string) => void;
  dex: GenerationSpeciesEntry[];
}) {
  const [speciesQuery, setSpeciesQuery] = useState(prefill ? cap(prefill.name) : "");
  const [speciesKey, setSpeciesKey] = useState<GenerationSpeciesEntry | null>(prefill);
  const [species, setSpecies] = useState<SpeciesDTO | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [level, setLevel] = useState(5);
  const [nickname, setNickname] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [item, setItem] = useState<string | null>(null);
  const [itemChoices, setItemChoices] = useState<string[]>([]);
  const [moves, setMoves] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!speciesKey) {
      setSpecies(null);
      setLegalMoves([]);
      return;
    }
    let cancelled = false;
    setMoves([]);
    Promise.all([getSpecies(speciesKey.pokeApiId), getLegalMoves(saveId, speciesKey.pokeApiId)])
      .then(([sp, legal]) => {
        if (cancelled) return;
        setSpecies(sp);
        setLegalMoves(legal);
      })
      .catch(() => !cancelled && onFlash(`Failed to load ${cap(speciesKey.name)} data.`));
    return () => {
      cancelled = true;
    };
  }, [speciesKey, saveId, onFlash]);

  useEffect(() => {
    const q = itemQuery.trim().toLowerCase();
    if (!q || item) {
      setItemChoices([]);
      return;
    }
    let cancelled = false;
    searchItems(q).then((list) => !cancelled && setItemChoices(list));
    return () => {
      cancelled = true;
    };
  }, [itemQuery, item]);

  const speciesResults = speciesKey ? [] : dex.filter((e) => e.name.includes(speciesQuery.trim().toLowerCase())).slice(0, 8);

  const toggleMove = (move: string) => {
    setMoves((prev) => {
      if (prev.includes(move)) return prev.filter((m) => m !== move);
      if (prev.length >= 4) {
        onFlash("Max of 4 moves.");
        return prev;
      }
      return [...prev, move];
    });
  };

  const submit = async () => {
    if (!speciesKey) return onFlash("Pick a species first.");
    setBusy(true);
    try {
      const input = {
        saveId,
        pokeApiId: speciesKey.pokeApiId,
        nickname: nickname.trim() || undefined,
        level,
        heldItem: item ?? undefined,
        moves,
      };
      if (partyFull) {
        await addToPc(input);
        onFlash(`Party full! ${cap(speciesKey.name)} went to the PC.`);
      } else {
        await addToParty(input);
        onFlash(`${cap(speciesKey.name)} joined the party.`);
      }
      onDone();
    } catch (e) {
      onFlash(e instanceof Error ? e.message : "Failed to register pokemon.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="NEW REGISTRATION" onBack={onBack}>
      <Panel>
        <SectionLabel>SPECIES *</SectionLabel>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 52, height: 52, flex: "0 0 52px", background: colors.frame, border: `2px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sprite url={species?.sprite} size={44} alt="sprite" />
          </div>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <SearchInput
              value={speciesQuery}
              onChange={(v) => {
                setSpeciesQuery(v);
                setSpeciesKey(null);
              }}
              placeholder="search species..."
            />
          </div>
        </div>
        {speciesResults.length > 0 ? (
          <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, maxHeight: 190, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {speciesResults.map((r) => (
              <button
                key={r.pokeApiId}
                onClick={() => {
                  setSpeciesKey(r);
                  setSpeciesQuery(cap(r.name));
                }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, minHeight: 48, background: "none", border: "none", borderBottom: `2px solid ${colors.frameAlt}`, textAlign: "left" }}
              >
                <span style={{ ...PIX, fontSize: 8, color: colors.text }}>{cap(r.name)}</span>
              </button>
            ))}
          </div>
        ) : null}
        <SectionLabel>LEVEL *</SectionLabel>
        <Stepper value={level} onChange={setLevel} />
        <SectionLabel>NICKNAME (OPTIONAL)</SectionLabel>
        <SearchInput value={nickname} onChange={(v) => setNickname(v.slice(0, 12))} placeholder="no nickname" />
        <SectionLabel>ITEM (OPTIONAL)</SectionLabel>
        <SearchInput
          value={itemQuery}
          onChange={(v) => {
            setItemQuery(v);
            setItem(null);
          }}
          placeholder="search item..."
        />
        {itemChoices.length > 0 ? (
          <div style={{ border: `2px solid ${colors.ink}`, background: colors.panelAlt, maxHeight: 170, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {itemChoices.map((it) => (
              <button
                key={it}
                onClick={() => {
                  setItem(it);
                  setItemQuery(cap(it));
                }}
                style={{ display: "flex", alignItems: "center", padding: 10, minHeight: 46, background: colors.panel, border: "none", borderBottom: `2px solid ${colors.frameAlt}`, textAlign: "left", fontSize: 8, color: colors.text, fontFamily: "'Press Start 2P', monospace" }}
              >
                {cap(it)}
              </button>
            ))}
          </div>
        ) : null}
        {item ? (
          <Btn variant="danger" onClick={() => { setItem(null); setItemQuery(""); }} minHeight={40} fontSize={8}>
            X CLEAR ITEM
          </Btn>
        ) : null}
      </Panel>

      <Panel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionLabel>MOVES</SectionLabel>
          <div style={{ ...VT, fontSize: 18, color: colors.red }}>{moves.length}/4</div>
        </div>
        {!species ? (
          <Hint>Pick a species to see its learnable moves.</Hint>
        ) : (
          legalMoves.map((m) => {
            const checked = moves.includes(m);
            return (
              <button
                key={m}
                onClick={() => toggleMove(m)}
                style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${colors.ink}`, background: checked ? colors.greenSoft : colors.panel, padding: 10, minHeight: 48, textAlign: "left" }}
              >
                <span style={{ width: 14, height: 14, flex: "0 0 14px", border: `2px solid ${colors.ink}`, background: checked ? colors.red : "#fff" }} />
                <span style={{ ...PIX, fontSize: 8, color: colors.text, flex: "1 1 auto" }}>{cap(m)}</span>
              </button>
            );
          })
        )}
      </Panel>

      <Btn variant="primary" full disabled={busy} onClick={() => void submit()}>
        REGISTER POKEMON
      </Btn>
    </PageShell>
  );
}
