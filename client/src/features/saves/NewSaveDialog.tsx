import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { SaveFields } from "./SaveFields";

export function NewSaveDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: {
    name: string;
    game: string;
    generation: number;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [generation, setGeneration] = useState(4);
  const [busy, setBusy] = useState(false);

  const canCreate = name.trim().length > 0 && game.length > 0;

  const reset = () => {
    setName("");
    setGame("");
    setGeneration(4);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NEW SAVE</DialogTitle>
        </DialogHeader>
        {open ? (
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
        ) : null}
        <DialogFooter>
          <Button
            variant="primary"
            full
            disabled={!canCreate || busy}
            onClick={() => {
              setBusy(true);
              void onCreate({ name: name.trim(), game, generation }).finally(
                () => setBusy(false),
              );
            }}
          >
            {busy ? "CREATING..." : "CREATE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
