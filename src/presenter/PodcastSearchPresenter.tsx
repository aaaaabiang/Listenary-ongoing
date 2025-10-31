import React, { useState, useEffect, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { PodcastSearchView } from '../views/PodcastSearchView';
// API 请求改由 Model 层提供方法，Presenter 不直接请求
import { getPrefetch, setPrefetch } from '../utils/prefetchCache';
import { podcastDiscoveryService } from '../service/podcastDiscoveryService';

type Props = { model: any };

const DEFAULT_LANG = 'en';
const PREFETCH_KEY = 'discover:trending:all:en' as const;

const PodcastSearchPresenter = observer(function PodcastSearchPresenter({ model: _model }: Props) {
  void _model; // model currently unused after service extraction
  const navigate = useNavigate();
  const location = useLocation();

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState<'discover' | 'search'>('discover');
  const [sortOrder, setSortOrder] = useState<'trending' | 'recent'>('trending');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | false>('all');
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayTitle, setDisplayTitle] = useState('Trending Podcasts');
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef(null);
  const isMountedRef = useRef(true);

  // NEW: 请求序号，防止旧请求覆盖新请求
  const requestIdRef = useRef(0);

  // --- Fetchers ---

  // NEW: 包一层，自动做竞态检查
  const safeSetData = useCallback((reqId: number, updater: () => void) => {
    if (requestIdRef.current === reqId) updater();
  }, []);

  const fetchDiscoverData = useCallback(
    async (
      category: string,
      sort: 'trending' | 'recent',
      lang: string = DEFAULT_LANG,
      options: { silent?: boolean } = {}
    ) => {
      const { silent = false } = options;
      const myReqId = ++requestIdRef.current; // NEW: 本次请求序号

      if (!silent) setIsLoading(true);
      setError(null);

      try {
        const result = await podcastDiscoveryService.fetchDiscoverData(category, sort, lang);

        // NEW: 仅当仍是最新请求时才写入
        safeSetData(myReqId, () => {
          if (result.success) {
            setPodcasts(result.data);
            if (category === 'all' && sort === 'trending' && lang === DEFAULT_LANG) {
              setPrefetch(PREFETCH_KEY, result.data);
            }
          } else {
            setError(result.error);
            setPodcasts([]);
          }
        });
      } catch (err: any) {
        console.error('Failed to fetch discover data:', err);
        safeSetData(myReqId, () => {
          setError(err.message);
          setPodcasts([]);
        });
      } finally {
        safeSetData(myReqId, () => {
          if (!silent) setIsLoading(false);
        });
      }
    },
    [safeSetData]
  );

  const fetchSearchResults = useCallback(async (term: string) => {
    if (!term.trim()) return;
    const myReqId = ++requestIdRef.current; // NEW
    setIsLoading(true);
    setError(null);
    try {
      const result = await podcastDiscoveryService.searchPodcasts(term);
      safeSetData(myReqId, () => {
        if (result.success) {
          setPodcasts(result.data);
        } else {
          setError(result.error);
          setPodcasts([]);
        }
      });
    } catch (err: any) {
      console.error('Failed to fetch search results:', err);
      safeSetData(myReqId, () => {
        setError(err.message);
        setPodcasts([]);
      });
    } finally {
      safeSetData(myReqId, () => setIsLoading(false));
    }
  }, [safeSetData]);

  // --- Effects ---

  useEffect(() => {
    isMountedRef.current = true;
    (async () => {
      try {
        const result = await podcastDiscoveryService.fetchCategories();
        if (isMountedRef.current) {
          if (result.success) {
            setCategories(result.data);
          } else {
            setError('Could not load podcast categories. Some features may be unavailable.');
          }
        }
      } catch (err) {
        console.error(err);
        if (isMountedRef.current) {
          setError('Could not load podcast categories. Some features may be unavailable.');
        }
      }
    })();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get('q');
    const categoryFromUrl = (params.get('category') || 'all').toLowerCase();
    const sortFromUrl = ((params.get('sort') as 'trending' | 'recent') || 'trending') as
      | 'trending'
      | 'recent';

    if (queryFromUrl) {
      // 搜索模式
      setDisplayMode('search');
      setSearchTerm(queryFromUrl);
      setSelectedCategory(false);
      setSortOrder('trending');
      setDisplayTitle(`Search Results for "${queryFromUrl}"`);

      setPodcasts([]);             // NEW: 切换模式先清屏
      setIsLoading(true);          // NEW: 仅显示骨架
      fetchSearchResults(queryFromUrl);
      return;
    }

    // 发现模式
    setDisplayMode('discover');
    setSearchTerm('');
    setSelectedCategory(categoryFromUrl);
    setSortOrder(sortFromUrl);

    const catObj = categories.find((c) => c.name === categoryFromUrl);
    const catName = categoryFromUrl === 'all' ? 'All Categories' : catObj?.name || categoryFromUrl;
    const sortName = sortFromUrl.charAt(0).toUpperCase() + sortFromUrl.slice(1);
    setDisplayTitle(`${sortName} in ${catName}`);

    // NEW: 切换 tab/排序 => 清屏 + 骨架
    setPodcasts([]);
    setIsLoading(true);

    // 命中缓存（仅默认组合）
    if (categoryFromUrl === 'all' && sortFromUrl === 'trending') {
      const cached = getPrefetch(PREFETCH_KEY);
      if (cached && cached.length) {
        setPodcasts(cached);     // 秒开
        setIsLoading(false);     // 结束首屏 loading
        fetchDiscoverData('all', 'trending', DEFAULT_LANG, { silent: true }); // 静默校准
        return;
      }
    }

    // 常规拉取
    if (categories.length > 0 || categoryFromUrl === 'all') {
      fetchDiscoverData(categoryFromUrl, sortFromUrl, DEFAULT_LANG);
    }
  }, [location.search, categories, fetchDiscoverData, fetchSearchResults]);

  // --- Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleSortChange = (e: React.MouseEvent<HTMLElement>, newSortOrder: string | null) => {
    if (newSortOrder && (newSortOrder === 'trending' || newSortOrder === 'recent')) {
      const params = new URLSearchParams(location.search);
      params.set('sort', newSortOrder);
      params.delete('q');
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleCategoryChange = (e: React.SyntheticEvent, newCategory: string) => {
    const params = new URLSearchParams();
    if (newCategory && newCategory !== 'all') params.set('category', newCategory);
    params.set('sort', sortOrder);
    navigate(`/search?${params.toString()}`);
  };

  const handlePodcastSelect = (podcast: any) => {
    if (podcast?.url) {
      navigate('/podcast-channel', { state: { rssUrl: podcast.url } });
    } else {
      setError('This podcast does not have a valid RSS feed URL.');
      console.error('Podcast does not have a valid RSS feed URL.', podcast);
    }
  };

  // NEW: 列表 key，切换 tab/排序强制重挂，避免过渡残影
  const listKey = `discover-${sortOrder}-${selectedCategory || 'none'}`;

  return (
    <PodcastSearchView
      key={listKey}                 // NEW: 强制 remount 列表容器
      searchTerm={searchTerm}
      onSearchTermChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      sortOrder={sortOrder}
      onSortChange={handleSortChange}
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      displayTitle={displayTitle}
      podcasts={podcasts}
      onPodcastSelect={handlePodcastSelect}
      isLoading={isLoading}
      error={error}
      sentinelRef={sentinelRef}
      hasMore={false}
      isLoadingMore={false}
    />
  );
});

export default PodcastSearchPresenter;
