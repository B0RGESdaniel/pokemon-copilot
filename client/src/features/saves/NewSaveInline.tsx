import { useState } from "react";
import { Button } from "../../components/ui/button";
import { SearchInput } from "../../components/SearchInput";
import { Stepper } from "../../components/Stepper";

export function NewSaveInline({
  onCreate,
  onCancel,
}: {
  onCreate: (input: {
    name: string;
    game: string;
    generation: number;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [generation, setGeneration] = useState(4);
  return (
    <div className="flex flex-col gap-1.5 border-t-2 border-frame-alt pt-1.5">
      <SearchInput value={name} onChange={setName} placeholder="save name" />
      <SearchInput
        value={game}
        onChange={setGame}
        placeholder="game (ex: platinum)"
      />
      <Stepper value={generation} onChange={setGeneration} min={1} max={9} />
      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          full
          fontSize={7}
          minHeight={36}
          onClick={onCancel}
        >
          CANCEL
        </Button>
        <Button
          variant="primary"
          full
          fontSize={7}
          minHeight={36}
          onClick={() =>
            void onCreate({ name, game: game.toLowerCase(), generation })
          }
        >
          CREATE
        </Button>
      </div>
    </div>
  );
}
