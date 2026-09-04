import type { CSSProperties, ReactNode } from "react";
import { colors, PIX, typeColor, VT } from "./theme";

export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        border: `3px solid ${colors.ink}`,
        background: colors.panel,
        boxShadow: `3px 3px 0 ${colors.ink}`,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div style={{ ...PIX, fontSize: 9, color: colors.text }}>{children}</div>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <div style={{ ...VT, fontSize: 18, color: colors.textMuted }}>{children}</div>;
}

type BtnVariant = "primary" | "secondary" | "danger" | "ghost" | "outlineDanger";

const variantStyle: Record<BtnVariant, CSSProperties> = {
  primary: {
    background: colors.blue,
    color: colors.white,
    boxShadow: `inset 0 3px 0 ${colors.blueLight}, 3px 3px 0 ${colors.ink}`,
    textShadow: `1px 1px 0 ${colors.ink}`,
    border: `3px solid ${colors.ink}`,
  },
  secondary: {
    background: colors.blueSoft,
    color: colors.ink,
    boxShadow: `inset 0 3px 0 ${colors.blueSofter}, 3px 3px 0 ${colors.ink}`,
    border: `3px solid ${colors.ink}`,
  },
  danger: {
    background: colors.red,
    color: colors.white,
    textShadow: `1px 1px 0 ${colors.ink}`,
    border: `2px solid ${colors.ink}`,
  },
  outlineDanger: {
    background: colors.bg,
    color: colors.red,
    boxShadow: `3px 3px 0 ${colors.ink}`,
    border: `3px solid ${colors.red}`,
  },
  ghost: {
    background: colors.panel,
    color: colors.ink,
    border: `2px solid ${colors.ink}`,
  },
};

export function Btn({
  children,
  onClick,
  variant = "secondary",
  full,
  disabled,
  style,
  fontSize = 9,
  minHeight = 48,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  full?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  fontSize?: number;
  minHeight?: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...PIX,
        fontSize,
        minHeight,
        width: full ? "100%" : undefined,
        padding: "8px 12px",
        opacity: disabled ? 0.5 : 1,
        ...variantStyle[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function TypeBadge({ type, size = 7 }: { type: string; size?: number }) {
  const [bg, fg] = typeColor(type);
  return (
    <span
      style={{
        ...PIX,
        fontSize: size,
        padding: "4px 5px",
        border: `2px solid ${colors.ink}`,
        background: bg,
        color: fg,
      }}
    >
      {type === "unknown" ? "???" : type.toUpperCase()}
    </span>
  );
}

export function Sprite({ url, size, alt }: { url: string | null | undefined; size: number; alt?: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={alt ?? "sprite"}
        style={{ width: size, height: size, objectFit: "contain", imageRendering: "pixelated" }}
      />
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ ...PIX, fontSize: Math.max(12, Math.round(size / 3.5)), color: colors.textFaint }}>?</div>
      {size > 90 ? <div style={{ ...VT, fontSize: 15, color: colors.textFaint }}>NO DATA</div> : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        fontSize: 21,
        padding: 11,
        border: `2px solid ${colors.ink}`,
        background: "#fff",
        color: colors.ink,
      }}
    />
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 100,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 52,
          height: 52,
          border: `2px solid ${colors.ink}`,
          background: colors.blueSoft,
          color: colors.ink,
          fontSize: 12,
          boxShadow: `inset 0 3px 0 ${colors.blueSofter}`,
        }}
      >
        -
      </button>
      <input
        value={String(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
          onChange(digits === "" ? min : Math.min(max, Number(digits)));
        }}
        inputMode="numeric"
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          textAlign: "center",
          fontSize: 26,
          padding: 8,
          border: `2px solid ${colors.ink}`,
          background: "#fff",
          color: colors.ink,
        }}
      />
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 52,
          height: 52,
          border: `2px solid ${colors.ink}`,
          background: colors.blueSoft,
          color: colors.ink,
          fontSize: 12,
          boxShadow: `inset 0 3px 0 ${colors.blueSofter}`,
        }}
      >
        +
      </button>
    </div>
  );
}

export function ConfirmBar({
  text,
  confirmLabel,
  onCancel,
  onConfirm,
  danger,
}: {
  text: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        border: `3px solid ${danger ? colors.red : colors.ink}`,
        background: danger ? colors.redSoft : colors.panelAlt,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <Hint>{text}</Hint>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="ghost" full onClick={onCancel}>
          CANCEL
        </Btn>
        <Btn variant={danger ? "danger" : "primary"} full onClick={onConfirm}>
          {confirmLabel}
        </Btn>
      </div>
    </div>
  );
}

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
