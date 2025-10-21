export function stripHtml(input: unknown): string {
  if (input == null) return "";
  // 兼容数组/对象：一律转字符串
  const initialStr = Array.isArray(input) ? String(input[0] ?? "") : String(input);

  // 1) 去掉所有 HTML 标签
  const withoutTags = initialStr.replace(/<\/?[^>]+>/g, " ");

  // 2) 解常见命名实体
  const entityMap: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };
  const withoutEntities = withoutTags.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => entityMap[m]);

  // 3) 解数字实体（十进制）
  const withoutNumericEntities = withoutEntities.replace(/&#(\d+);/g, (_, code) => {
    const n = parseInt(code, 10);
    return Number.isFinite(n) ? String.fromCharCode(n) : "";
  });

  // 4) 折叠多余空白并去首尾
  return withoutNumericEntities.replace(/\s+/g, " ").trim();
}
