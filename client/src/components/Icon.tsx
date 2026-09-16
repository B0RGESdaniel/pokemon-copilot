// pixelarticons ships raw SVGs with fill="currentColor" — rendered inline
// (not as a mask-image url()) so currentColor actually inherits this
// element's `color` via normal CSS inheritance. Recolor with text-*, not bg-*.
export function Icon({ svg, className }: { svg: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block [&>svg]:block [&>svg]:size-full ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
