// 简易内存 + localStorage 双层缓存（5 分钟失效）
import { podcastCacheService } from "../service/podcastCacheService";

type Key = "discover:trending:all:en";

type CacheShape = {
  [key in Key]?: { ts: number; data: any[] }
}

const mem: CacheShape = {};

export function getPrefetch(key: Key, maxAgeMs = 5 * 60 * 1000) {
  const now = Date.now();
  const inMem = mem[key];
  if (inMem && now - inMem.ts < maxAgeMs) return inMem.data;

  const ls = podcastCacheService.loadPrefetchCache()[key];
  if (ls && now - ls.ts < maxAgeMs) {
    mem[key] = ls; // 回灌内存
    return ls.data;
  }
  return null;
}
export function setPrefetch(key: Key, data: any[]) {
  const entry = { ts: Date.now(), data };
  mem[key] = entry;
  const ls = podcastCacheService.loadPrefetchCache();
  ls[key] = entry;
  podcastCacheService.savePrefetchCache(ls);
}
