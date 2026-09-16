import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function ConfirmDialog({
  open,
  text,
  confirmLabel,
  onCancel,
  onConfirm,
  danger,
}: {
  open: boolean;
  text: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogTitle>{text}</AlertDialogTitle>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>CANCEL</AlertDialogCancel>
          <AlertDialogAction
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
