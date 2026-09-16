import { SearchInput } from "../../components/SearchInput";
import { SectionLabel } from "../../components/SectionLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { GENERATION_GAMES } from "../../types/saves";

const GENERATIONS = Array.from({ length: 9 }, (_, i) => ({
  value: String(i + 1),
  label: `GEN ${i + 1}`,
}));

export function SaveFields({
  name,
  onNameChange,
  game,
  onGameChange,
  generation,
  onGenerationChange,
}: {
  name: string;
  onNameChange: (v: string) => void;
  game: string;
  onGameChange: (v: string) => void;
  generation: number;
  onGenerationChange: (v: number) => void;
}) {
  const games = GENERATION_GAMES[generation] ?? [];

  return (
    <>
      <SectionLabel>NOME DO SAVE *</SectionLabel>
      <SearchInput
        value={name}
        onChange={onNameChange}
        placeholder="ex: Minha run de Platinum"
      />

      <SectionLabel>GERAÇÃO *</SectionLabel>
      <Select
        items={GENERATIONS}
        value={String(generation)}
        onValueChange={(v) => onGenerationChange(Number(v))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GENERATIONS.map((g) => (
            <SelectItem key={g.value} value={g.value}>
              {g.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <SectionLabel>JOGO *</SectionLabel>
      <Select
        items={games}
        value={game}
        onValueChange={(v) => onGameChange(v ?? "")}
      >
        <SelectTrigger>
          <SelectValue placeholder="escolha o jogo" />
        </SelectTrigger>
        <SelectContent>
          {games.map((g) => (
            <SelectItem key={g.value} value={g.value}>
              {g.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
