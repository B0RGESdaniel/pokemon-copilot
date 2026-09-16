import { useCallback } from "react";
import { toast } from "../components/ui/toast";

export function useFlash() {
  const flash = useCallback((text: string) => {
    toast.add({ title: text, timeout: 2800 });
  }, []);

  return { flash };
}
