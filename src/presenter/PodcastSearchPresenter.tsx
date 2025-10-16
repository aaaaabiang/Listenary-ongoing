// src/presenter/PodcastSearchPresenter.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { PodcastSearchView } from '../views/PodcastSearchView';

type Props = { model: any };

const PodcastSearchPresenter = observer(function PodcastSearchPresenter({ model }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState('discover'); // 'discover' or 'search'
  const [sortOrder, setSortOrder] = useState<'trending' | 'recent'>('trending');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayTitle, setDisplayTitle] = useState('Trending Podcasts');
  const [error, setError] = useState<string | null>(null);
  
  // Note: Infinite scroll logic is not implemented here as the backend endpoints
  // currently fetch a fixed number of results without pagination.
  // The props (sentinelRef, etc.) are kept for future compatibility.
  const sentinelRef = useRef(null);


  // --- Data Fetching Logic ---
  const fetchDiscoverData = useCallback(async (category: string, sort: string, lang: string = 'en') => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({ lang, sort });
    if (category && category !== 'all') {
      params.append('category', category);
    }
    try {
      const response = await fetch(`/api/podcasts/discover?${params.toString()}`);
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
      const response = await fetch(`/api/podcasts/search?q=${encodeURIComponent(term)}`);
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
  
  // --- Initial Data Load ---
  useEffect(() => {
    // 1. Fetch categories for the tabs
    fetch('/api/podcasts/categories')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to load categories'))
      .then(setCategories)
      .catch(err => {
        console.error(err);
        setError('Could not load podcast categories. Some features may be unavailable.');
      });

    // 2. Check for URL search query on initial load
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get('q');
    if (queryFromUrl) {
      setSearchTerm(queryFromUrl);
      setDisplayMode('search');
      setSelectedCategory(null);
      setDisplayTitle(`Search Results for "${queryFromUrl}"`);
      fetchSearchResults(queryFromUrl);
    } else {
      // Fetch initial discover content (trending in all categories)
      fetchDiscoverData('all', 'trending');
    }
  }, [fetchDiscoverData, fetchSearchResults, location.search]);

  // --- Event Handlers ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`); // Update URL to reflect search
    // The useEffect listening to location.search will then trigger the fetch
  };

  const handleSortChange = (event: React.MouseEvent<HTMLElement>, newSortOrder: string | null) => {
    if (newSortOrder && (newSortOrder === 'trending' || newSortOrder === 'recent')) {
      setSortOrder(newSortOrder);
      // If we are not in search mode, re-fetch with the new sort order
      if (displayMode === 'discover') {
        const catName = selectedCategory === 'all' ? 'All Categories' : selectedCategory;
        const sortName = newSortOrder.charAt(0).toUpperCase() + newSortOrder.slice(1);
        setDisplayTitle(`${sortName} in ${catName}`);
        fetchDiscoverData(selectedCategory || 'all', newSortOrder);
      }
    }
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newCategory: string) => {
    navigate('/search'); // Clear any "?q=" from URL
    setSearchTerm(''); 
    setDisplayMode('discover');
    setSelectedCategory(newCategory);
    const catName = newCategory === 'all' ? 'All Categories' : newCategory;
    const sortName = sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1);
    setDisplayTitle(`${sortName} in ${catName}`);
    fetchDiscoverData(newCategory, sortOrder);
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
      // Pass down infinite scroll props, though they are currently unused by the logic
      sentinelRef={sentinelRef}
      hasMore={false} 
      isLoadingMore={false}
    />
  );
});

export default PodcastSearchPresenter;