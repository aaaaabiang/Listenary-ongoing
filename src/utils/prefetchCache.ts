// 简易内存 + localStorage 双层缓存（5 分钟失效）
type Key = "discover:trending:all:en";
const LS_KEY = "listenary.prefetch.v1";

type CacheShape = {
  [key in Key]?: { ts: number; data: any[] }
}

const mem: CacheShape = {};

function readLS(): CacheShape {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function writeLS(obj: CacheShape) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch {}
}
export function getPrefetch(key: Key, maxAgeMs = 5 * 60 * 1000) {
  const now = Date.now();
  const inMem = mem[key];
  if (inMem && now - inMem.ts < maxAgeMs) return inMem.data;

  const ls = readLS()[key];
  if (ls && now - ls.ts < maxAgeMs) {
    mem[key] = ls; // 回灌内存
    return ls.data;
  }
  return null;
}
export function setPrefetch(key: Key, data: any[]) {
  const entry = { ts: Date.now(), data };
  mem[key] = entry;
  const ls = readLS();
  ls[key] = entry;
  writeLS(ls);
}
