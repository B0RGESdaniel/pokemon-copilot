import { useCallback, useRef, useState } from "react";

export function useFlash() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flash = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(null), 2800);
  }, []);

  return { message, flash };
}
