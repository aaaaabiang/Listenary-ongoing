// src/presenter/HomePagePresenter.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { HomePageView } from "../views/HomePageView";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import type { PodcastItem } from "../hooks/useInfinitePodcastSearch";

const PAGE_SIZE = 20;

type Props = { model: any };

const HomePagePresenter = observer(function HomePagePresenter(props: Props) {
  const navigate = useNavigate();
  
  // === States från gamla HomePagePresenter ===
  const savedPodcasts = props.model.savedPodcasts;
  const [errorMsg, setErrorMsg] = useState("");
  const [homeInput, setHomeInput] = useState("");
  const [discoverInput, setDiscoverInput] = useState("");

  // === States for search and discovery functionality ===
  const [searchResults, setSearchResults] = useState<PodcastItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  
  const [sortBy, setSortBy] = useState('trending'); // Standard till 'trending'
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  
  // State för att avgöra om vi visar startsidan eller sökresultat
  const [isSearching, setIsSearching] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // === Logik från båda presenters ===

  // Hämta kategorier vid start
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/podcasts/categories');
        if (res.ok) setCategories(await res.json());
      } catch (err) {
        console.error("Kunde inte hämta kategorier", err);
      }
    };
    fetchCategories();
  }, []);

  // Helper-funktioner för att tolka API-svar
  const parseItems = (data: any) => Array.isArray(data) ? data : data.items;
  const parseHasMore = (data: any) => Array.isArray(data) ? data.length === PAGE_SIZE : (data.hasMore ?? data.items.length === PAGE_SIZE);

  // Kärnfunktion för att hämta data (kombinerad från båda)
  const fetchData = useCallback(
    async (term: string, nextPage: number, append: boolean) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      append ? setIsLoadingMore(true) : setIsLoading(true);
    setErrorMsg("");

      let endpoint = '';
      const params = new URLSearchParams({ page: `${nextPage}`, limit: `${PAGE_SIZE}` });

      if (sortBy === 'trending') {
        endpoint = '/api/podcasts/trending';
        // 'trending' behöver inte nödvändigtvis en sökterm
      } else {
        endpoint = '/api/podcasts/search';
        if (!term.trim()) {
           // Om sökfältet är tomt men vi inte är i 'trending', avbryt.
          setIsLoading(false);
          setIsLoadingMore(false);
          setSearchResults([]);
          return;
        }
        params.append('q', term);
      }
      
      if (selectedLang) params.append('lang', selectedLang);
      if (selectedCategory) params.append('cat', selectedCategory);
      
      const url = `${endpoint}?${params.toString()}`;

      try {
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`API request failed: ${res.statusText}`);
        
        const data = await res.json();
        let items = parseItems(data);
        const more = parseHasMore(data);

        // Klientsidessortering för "Senast uppdaterad"
        if (sortBy === 'updated' && Array.isArray(items)) {
          items.sort((a, b) => (b.lastUpdateTime || 0) - (a.lastUpdateTime || 0));
        }

        setSearchResults(prev => (append ? [...prev, ...items] : items));
        setHasMore(more);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setErrorMsg("Failed to fetch results. The API might be down or your search returned no results.");
          console.error(err);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [sortBy, selectedLang, selectedCategory]
  );
  
  // Effekt för att köra en första sökning när sidan laddas (visar trendande innehåll)
  useEffect(() => {
    setIsSearching(false); // 初始加载时不是搜索状态
    fetchData("", 1, false);
  }, []); // Körs bara en gång vid start

  // Effekt för oändlig scrollning
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore) {
          const currentSearchTerm = discoverInput.trim() || homeInput.trim();
          fetchData(currentSearchTerm, searchResults.length / PAGE_SIZE + 1, true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, discoverInput, homeInput, searchResults.length, fetchData]);


  // Handlers
  function inputHandlerACB(event: React.ChangeEvent<HTMLInputElement>) {
    setHomeInput(event.target.value);
  }

  function discoverInputHandlerACB(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setDiscoverInput(value);
    
    // 如果搜索框被清空，重置搜索状态并显示 trending 内容
    if (!value.trim()) {
      setIsSearching(false);
      setSortBy('trending');
    }
  }
  
  // När användaren klickar på "Parse/Search"-knappen
  function handleDiscoverSubmit() {
    const term = (discoverInput || '').trim();
    // 对齐 Discover 页面：有关键词则按相关度搜索；无关键词展示 trending
    if (term) {
      setSortBy('relevance');
    } else {
      setSortBy('trending');
    }
    setIsSearching(true);
    setSearchResults([]);
    fetchData(term, 1, false);
  }

  function handleTopSubmit() {
    // 顶部搜索：处理 RSS 链接或搜索词
    const term = (homeInput || '').trim();
    
    if (!term) {
      setErrorMsg("Please enter an RSS link or search term!");
      return;
    }

    // 检查是否是 RSS 链接
    if (isValidRssUrl(term)) {
      // 是 RSS 链接，直接跳转到播客频道
      navigate("/podcast-channel", { state: { rssUrl: term } });
    } else {
      // 不是 RSS 链接，当作搜索词处理
      setDiscoverInput(term); // 同步到 Discover 搜索框
      handleDiscoverSubmit();
    }
  }

  // RSS URL 验证函数
  function isValidRssUrl(url: string): boolean {
    try {
      new URL(url);
    } catch (e) {
      return false;
    }

    // RSS 链接模式验证
    const rssPatterns = [
      /\.xml$/i, // .xml 结尾
      /\/feed/i, // 包含 /feed
      /\/rss/i, // 包含 /rss
      /\/podcast/i, // 包含 /podcast
      /\/itunes/i, // 包含 /itunes
      /\/feedburner/i, // 包含 /feedburner
    ];

    return rssPatterns.some(pattern => pattern.test(url));
  }

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: any) => {
      setter(event.target.value as string);
  };
  
  // Kör en ny sökning när filter ändras
  useEffect(() => {
    // 避免在初始加载时触发
    if (isLoading) return;
    
    // 获取当前搜索词（优先使用 discoverInput，如果为空则使用 homeInput）
    const currentSearchTerm = discoverInput.trim() || homeInput.trim();
    
    // 只有在有搜索词时才设置为搜索状态
    if (currentSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    
    fetchData(currentSearchTerm, 1, false);
  }, [sortBy, selectedLang, selectedCategory]);

  function handlePodcastSelect(podcast: PodcastItem) {
    if (podcast?.url) {
      navigate("/podcast-channel", { state: { rssUrl: podcast.url } });
      } else {
      setErrorMsg("This podcast does not have a valid RSS feed URL.");
    }
  }

  function handleRssLinkClick(event: React.MouseEvent, url: string) {
    event.preventDefault();
    setHomeInput(url);
    // 直接跳转到播客频道页面
    navigate("/podcast-channel", { state: { rssUrl: url } });
  }

  return (
      <HomePageView
      // Props för sökfältet
        url={homeInput} 
        onInputChange={inputHandlerACB}
        discoverUrl={discoverInput}
        onDiscoverInputChange={discoverInputHandlerACB}
      onTopSubmit={handleTopSubmit}
      onDiscoverSubmit={handleDiscoverSubmit}
      onRssLinkClick={handleRssLinkClick}
      
      // Props för att visa resultat
      isSearching={isSearching}
      searchResults={searchResults}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      errorMsg={errorMsg}
      onPodcastSelect={handlePodcastSelect}
      
      // Props för filter/sortering
      sortBy={sortBy}
      onSortChange={handleFilterChange(setSortBy)}
      selectedLang={selectedLang}
      onLangChange={handleFilterChange(setSelectedLang)}
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={handleFilterChange(setSelectedCategory)}
      
      // Övriga props
        savedPodcasts={savedPodcasts}
      onSavedPodcastClick={handlePodcastSelect}
      sentinelRef={sentinelRef}
      hasMore={hasMore}
    />
  );
});

export default HomePagePresenter;


