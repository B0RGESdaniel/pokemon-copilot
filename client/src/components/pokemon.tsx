import { colors, PIX, typeColor, VT } from "../theme";

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
