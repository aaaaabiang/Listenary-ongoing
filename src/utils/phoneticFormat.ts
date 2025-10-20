export function formatPhonetic(raw?: string): string {
  if (!raw) return "";

  return raw
    .replace(/\*+/g, "·")
    .replace(/[•∙⋅·]{2,}/g, "·") // 合并重复音节点
    .replace(/\s*·\s*/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
