export function cap(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/-/g, " ")
    .toUpperCase();
}
