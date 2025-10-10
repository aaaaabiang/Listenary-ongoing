// src/presenter/PodcastSearchPresenter.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PodcastSearchView } from "../views/PodcastSearchView";
import { observer } from "mobx-react-lite";

const recommendedSearchTerms = ["technology", "history", "science", "comedy", "news", "storytelling"];
const PAGE_SIZE = 20;

type Props = { model: any };

// 兼容两种后端返回结构：数组 或 { items, hasMore, total }
type PageResp<T = any> = { items: T[]; hasMore?: boolean; total?: number } | T[];

const PodcastSearchPresenter = observer(function PodcastSearchPresenter({ model }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const abortRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 解析后端响应
  function parseItems(data: PageResp) {
    return Array.isArray(data) ? data : data.items;
  }
  function parseHasMore(data: PageResp, pageSize: number) {
    if (Array.isArray(data)) return data.length === pageSize;
    return data.hasMore ?? data.items.length === pageSize;
  }

  const fetchPage = useCallback(
    async (term: string, nextPage: number, append: boolean) => {
      if (!term.trim()) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      append ? setIsLoadingMore(true) : setIsLoading(true);
      setError(null);

      try {
        // 假设后端支持分页参数；不支持也能工作（见下面解析）
        const url = `/api/podcasts/search?q=${encodeURIComponent(term)}&page=${nextPage}&limit=${PAGE_SIZE}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);
        const data: PageResp = await res.json();
        const items = parseItems(data);
        const more = parseHasMore(data, PAGE_SIZE);

        setSearchResults((prev) => (append ? [...prev, ...items] : items));
        setHasMore(more);
        setPage(nextPage);
        setHasSearched(true);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError("Failed to fetch podcasts. The API might be down or your search term returned no results.");
          console.error(err);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // 统一的搜索入口：重置为第 1 页
  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) return;
      setSearchResults([]);
      setPage(1);
      setHasMore(false);
      await fetchPage(term, 1, false);
    },
    [fetchPage]
  );

  // 读取 ?q=，否则用随机推荐
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    if (q) {
      setSearchTerm(q);
      performSearch(q);
    } else {
      const randomTerm = recommendedSearchTerms[Math.floor(Math.random() * recommendedSearchTerms.length)];
      setSearchTerm(randomTerm);
      performSearch(randomTerm);
    }
  }, [location.search, performSearch]);

  // 输入变更
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // 提交搜索
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    performSearch(searchTerm);
  };

  // 选择卡片 → 跳频道
  const handlePodcastSelect = (podcast: any) => {
    if (podcast.url) {
      navigate("/podcast-channel", { state: { rssUrl: podcast.url } });
    } else {
      setError("This podcast does not have a valid RSS feed URL.");
    }
  };

  // 触底加载更多（IntersectionObserver）
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading && !isLoadingMore) {
          fetchPage(searchTerm, page + 1, true);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [hasMore, isLoading, isLoadingMore, fetchPage, page, searchTerm]);

  return (
    <PodcastSearchView
      searchTerm={searchTerm}
      onSearchTermChange={handleSearchTermChange}
      onSearchSubmit={handleSearchSubmit}
      searchResults={searchResults}
      isLoading={isLoading}
      error={error}
      onPodcastSelect={handlePodcastSelect}
      hasSearched={hasSearched}
      // 新增：分页/无限滚动需要
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      sentinelRef={sentinelRef}
      pageSize={PAGE_SIZE}
    />
  );
});

export default PodcastSearchPresenter;
