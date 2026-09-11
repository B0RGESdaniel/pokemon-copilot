import { useState } from "react";
import { Btn } from "../../../components/Btn";
import { PageShell } from "../../../components/PageShell";
import type { Save } from "../../../types/saves";
import { NewSaveInline } from "../NewSaveInline";
import { SaveRow } from "./SaveRow";

export function ManageSavesPage({
  saves,
  selectedSaveId,
  onBack,
  onCreate,
  onDelete,
  onFlash,
}: {
  saves: Save[];
  selectedSaveId: string;
  onBack: () => void;
  onCreate: (input: {
    name: string;
    game: string;
    generation: number;
  }) => Promise<Save>;
  onDelete: (id: string) => Promise<void>;
  onFlash: (msg: string) => void;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <PageShell title="MANAGE SAVES" onBack={onBack}>
      {saves.map((s) => (
        <SaveRow
          key={s.id}
          save={s}
          isActive={s.id === selectedSaveId}
          onDelete={async () => {
            try {
              await onDelete(s.id);
              onFlash(`"${s.name}" excluído.`);
            } catch (e) {
              onFlash(e instanceof Error ? e.message : "Failed to delete save.");
            }
          }}
        />
      ))}

      {creating ? (
        <NewSaveInline
          onCancel={() => setCreating(false)}
          onCreate={async (input) => {
            await onCreate(input);
            setCreating(false);
          }}
        />
      ) : (
        <Btn variant="primary" full onClick={() => setCreating(true)}>
          + NEW SAVE
        </Btn>
      )}
    </PageShell>
  );
}
