import type { ReactNode } from "react";
import { colors, PIX, VT } from "../theme";
import { Btn } from "./primitives";

export function PageShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, background: colors.bg, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: "0 0 auto",
          background: colors.navy,
          borderBottom: `3px solid ${colors.ink}`,
          boxShadow: `inset 0 -4px 0 ${colors.navyDark}`,
          padding: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Btn variant="secondary" onClick={onBack} minHeight={44} fontSize={8} style={{ padding: "10px 12px" }}>
          &lt; BACK
        </Btn>
        <div
          style={{
            ...PIX,
            fontSize: 8,
            color: colors.white,
            textShadow: `2px 2px 0 ${colors.ink}`,
            marginLeft: "auto",
            textAlign: "right",
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "10px 10px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

export function FlashMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      style={{
        flex: "0 0 auto",
        background: "#f5e6a8",
        borderBottom: `3px solid ${colors.ink}`,
        padding: "8px 12px",
        ...VT,
        fontSize: 19,
        color: colors.navy,
      }}
    >
      &gt; {message}
    </div>
  );
}
