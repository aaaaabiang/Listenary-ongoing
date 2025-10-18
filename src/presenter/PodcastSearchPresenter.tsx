// src/presenter/PodcastSearchPresenter.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { PodcastSearchView } from '../views/PodcastSearchView';
import { apiRequest } from '../config/apiConfig';

type Props = { model: any };

const PodcastSearchPresenter = observer(function PodcastSearchPresenter({ model }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState('discover');
  const [sortOrder, setSortOrder] = useState<'trending' | 'recent'>('trending');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  // 修改：允许值为 false，用于取消选中状态
  const [selectedCategory, setSelectedCategory] = useState<string | false>('all');
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayTitle, setDisplayTitle] = useState('Trending Podcasts');
  const [error, setError] = useState<string | null>(null);
  
  const sentinelRef = useRef(null);

  // --- Data Fetching Logic (Callbacks) ---
  const fetchDiscoverData = useCallback(async (category: string, sort: string, lang: string = 'en') => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({ lang, sort });
    if (category && category !== 'all') {
      params.append('category', category);
    }
    try {
      const response = await apiRequest(`/api/podcasts/discover?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch discovery data. Please try again later.');
      const data = await response.json();
      setPodcasts(data);
    } catch (err: any) {
      console.error("Failed to fetch discover data:", err);
      setError(err.message);
      setPodcasts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSearchResults = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/api/podcasts/search?q=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error('Failed to fetch search results. Please try again later.');
      const data = await response.json();
      setPodcasts(data);
    } catch (err: any) {
      console.error("Failed to fetch search results:", err);
      setError(err.message);
      setPodcasts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // --- State & Data Loading Effects ---

  // Effect 1: 只在组件首次加载时获取一次分类列表。
  useEffect(() => {
    apiRequest('/api/podcasts/categories')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to load categories'))
      .then(setCategories)
      .catch(err => {
        console.error(err);
        setError('Could not load podcast categories. Some features may be unavailable.');
      });
  }, []); // 空依赖数组确保只运行一次

  // Effect 2: 监听 URL 和 分类列表的变化，来决定加载什么内容。
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get('q');
    const categoryFromUrl = params.get('category') || 'all';
    const sortFromUrl = (params.get('sort') as 'trending' | 'recent') || 'trending';

    if (queryFromUrl) {
      // 搜索模式
      setDisplayMode('search');
      setSearchTerm(queryFromUrl);
      setSelectedCategory(false); // 使用 false 来取消选中，避免 MUI 警告
      setSortOrder('trending');
      setDisplayTitle(`Search Results for "${queryFromUrl}"`);
      fetchSearchResults(queryFromUrl);
    } else {
      // 浏览模式
      // **关键修复**：只有在分类列表加载完成后，才去设置和获取数据
      // 这样可以保证 `setSelectedCategory` 的值在 `Tabs` 组件中是有效的。
      if (categories.length > 0) {
        setDisplayMode('discover');
        setSearchTerm('');
        
        setSelectedCategory(categoryFromUrl);
        setSortOrder(sortFromUrl);
        
        const catObject = categories.find(c => c.name === categoryFromUrl);
        const catName = categoryFromUrl === 'all' ? 'All Categories' : (catObject ? catObject.name : categoryFromUrl);
        const sortName = sortFromUrl.charAt(0).toUpperCase() + sortFromUrl.slice(1);
        setDisplayTitle(`${sortName} in ${catName}`);

        fetchDiscoverData(categoryFromUrl, sortFromUrl);
      } else if (categoryFromUrl === 'all') {
        // 如果分类还没加载，但目标是 'all'，可以先加载 'all' 的数据
        fetchDiscoverData('all', sortFromUrl);
      }
      // 如果分类没加载，且目标不是 'all'，则此 effect 会暂时不做任何事，
      // 等待 `categories` 状态更新后，它会自动重新运行。
    }
  }, [location.search, categories, fetchDiscoverData, fetchSearchResults]);


  // --- Event Handlers ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleSortChange = (event: React.MouseEvent<HTMLElement>, newSortOrder: string | null) => {
    if (newSortOrder && (newSortOrder === 'trending' || newSortOrder === 'recent')) {
      const params = new URLSearchParams(location.search);
      params.set('sort', newSortOrder);
      params.delete('q');
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newCategory: string) => {
    const params = new URLSearchParams();
    if (newCategory && newCategory !== 'all') {
      params.set('category', newCategory); 
    }
    params.set('sort', sortOrder); 
    navigate(`/search?${params.toString()}`);
  };
  
  const handlePodcastSelect = (podcast: any) => {
    if (podcast.url) {
      navigate('/podcast-channel', { state: { rssUrl: podcast.url } });
    } else {
      setError("This podcast does not have a valid RSS feed URL.");
      console.error("Podcast does not have a valid RSS feed URL.", podcast);
    }
  };

  return (
    <PodcastSearchView
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