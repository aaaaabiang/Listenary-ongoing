import { useCallback, useRef, useState } from "react";

export type PodcastItem = {
  id?: string;
  title: string;
  author?: string;
  image?: string;
  url?: string;           // RSS
  description?: string;
  categories?: string[];
  lastUpdated?: string;   // ISO 时间字符串
  episodesCount?: number;
};

type PageResp = {
  items: PodcastItem[];
  total?: number;
  hasMore?: boolean; // 后端若返回就用它；否则用长度推断
};

const PAGE_SIZE = 20;

export default function useInfinitePodcastSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PodcastItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 取消上一次请求，避免竞态
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(async (q: string, p: number, append: boolean) => {
    // 移除空搜索词的检查，允许返回全部结果
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);

    try {
      // 如果没有搜索词，仍然调用 API（后端会返回全部热门播客）
      const url = q.trim() 
        ? `/api/podcasts/search?q=${encodeURIComponent(q)}&page=${p}&limit=${PAGE_SIZE}`
        : `/api/podcasts/search?page=${p}&limit=${PAGE_SIZE}`;
      const res = await fetch(url, { signal: ac.signal });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data: PageResp | PodcastItem[] = await res.json();

      // 兼容两种返回结构
      const items = Array.isArray(data) ? data : data.items;
      const nextHasMore = Array.isArray(data)
        ? items.length === PAGE_SIZE
        : Boolean(data.hasMore ?? items.length === PAGE_SIZE);

      setResults(prev => (append ? [...prev, ...items] : items));
      setHasMore(nextHasMore);
      setPage(p);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || "Search failed");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const startSearch = useCallback(async (q: string) => {
    setQuery(q);
    setResults([]);
    setPage(1);
    setHasMore(false);
    await fetchPage(q, 1, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;
    await fetchPage(query, page + 1, true);
  }, [fetchPage, hasMore, isLoading, isLoadingMore, page, query]);

  return {
    query, setQuery,
    results, isLoading, isLoadingMore, error, hasMore,
    startSearch, loadMore,
  };
}
