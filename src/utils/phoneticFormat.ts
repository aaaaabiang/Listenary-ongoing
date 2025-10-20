export function formatPhonetic(raw?: string): string {
  if (!raw) return "";
  let s = raw;

  // 1) 将星号当作音节点：*  -> ·
  // 连续多个 * 合并成一个
  s = s.replace(/\*+/g, "·");

  //   // 2) 如果有少见的中点替代符也统一一下
  //   s = s.replace(/[•∙⋅·]{2,}/g, "·"); // 合并重复音节点

  // 3) 音节点两侧留空格更易读
  s = s.replace(/\s*·\s*/g, " · ");

  // 4) 去掉多余空格
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}
