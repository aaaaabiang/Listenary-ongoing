export function formatPhonetic(raw?: string): string {
  if (!raw) return "";

  return raw
    .replace(/\*+/g, "·")
    .replace(/\s*·\s*/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
