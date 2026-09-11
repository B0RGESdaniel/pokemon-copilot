const spriteSizeClass: Record<number, string> = {
  44: "h-11 w-11",
  46: "h-11.5 w-11.5",
  48: "h-12 w-12",
  64: "h-16 w-16",
  68: "h-17 w-17",
  120: "h-30 w-30",
  132: "h-33 w-33",
};

export function Sprite({
  url,
  size,
  alt,
}: {
  url: string | null | undefined;
  // "fill" fits the sprite to its (responsive) parent box instead of a fixed px size —
  // use it for boxes sized in % so the sprite scales down on narrow screens.
  size: number | "fill";
  alt?: string;
}) {
  const knownSize =
    typeof size === "number" ? spriteSizeClass[size] : undefined;
  if (url) {
    return (
      <img
        src={url}
        alt={alt ?? "sprite"}
        className={`object-contain ${size === "fill" ? "h-full w-full" : (knownSize ?? "")}`}
        style={
          size === "fill" || knownSize
            ? undefined
            : { width: size, height: size }
        }
      />
    );
  }
  const fallbackFontSize =
    size === "fill" ? 32 : Math.max(12, Math.round(size / 3.5));
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="font-pix text-text-faint"
        style={{ fontSize: fallbackFontSize }}
      >
        ?
      </div>
      {size === "fill" || size > 90 ? (
        <div className="font-pix text-[16px] text-text-faint">NO DATA</div>
      ) : null}
    </div>
  );
}
