import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { ConfirmBar } from "../../../components/ConfirmBar";
import { Card } from "../../../components/ui/card";
import type { Save } from "../../../types/saves";

export function SaveRow({
  save,
  isActive,
  onDelete,
}: {
  save: Save;
  isActive: boolean;
  onDelete: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (confirming) {
    return (
      <ConfirmBar
        danger
        text={`Excluir "${save.name}"? Isso remove permanentemente os Pokémon e a batalha desse save. Essa ação não pode ser desfeita.`}
        confirmLabel={busy ? "EXCLUINDO..." : "SIM, EXCLUIR"}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setBusy(true);
          void onDelete().finally(() => setBusy(false));
        }}
      />
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="font-pix text-[8px] leading-[1.4] wrap-break-word text-text">
            {save.name.toUpperCase()}
            {isActive ? <span className="text-blue"> · ATIVO</span> : null}
          </div>
          <div className="font-vt text-[16px] leading-none text-text-muted">
            {save.game.toUpperCase()} · GEN {save.generation}
          </div>
        </div>
        <Button
          variant="outlineDanger"
          fontSize={7}
          minHeight={36}
          onClick={() => setConfirming(true)}
        >
          DELETE
        </Button>
      </div>
    </Card>
  );
}
