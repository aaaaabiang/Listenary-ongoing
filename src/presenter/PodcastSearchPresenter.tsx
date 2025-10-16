// src/presenter/PodcastSearchPresenter.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { PodcastSearchView } from '../views/PodcastSearchView';

type Props = { model: any };

const PodcastSearchPresenter = observer(function PodcastSearchPresenter({ model }: Props) {
  const navigate = useNavigate();

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState('discover'); // 'discover' or 'search'
  const [sortOrder, setSortOrder] = useState('trending'); // 'trending' or 'recent'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [podcasts, setPodcasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayTitle, setDisplayTitle] = useState('Trending Podcasts');

  // --- Data Fetching Logic ---
  const fetchDiscoverData = useCallback(async (category, sort, lang = 'en') => {
    setIsLoading(true);
    const params = new URLSearchParams({ lang, sort });
    if (category && category !== 'all') {
      params.append('category', category);
    }
    try {
      const response = await fetch(`/api/podcasts/discover?${params.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPodcasts(data);
    } catch (error) {
      console.error("Failed to fetch discover data:", error);
      setPodcasts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSearchResults = useCallback(async (term) => {
    if (!term.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/podcasts/search?q=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPodcasts(data);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setPodcasts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // --- Initial Data Load for the Page ---
  useEffect(() => {
    // 1. Fetch categories for the tabs
    fetch('/api/podcasts/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.error("Failed to fetch categories:", err));

    // 2. Fetch initial content (trending in all categories)
    fetchDiscoverData('all', 'trending');
  }, [fetchDiscoverData]);

  // --- Event Handlers ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setDisplayMode('search');
    setSelectedCategory(null); // Deselect category tabs
    setDisplayTitle(`Search Results for "${searchTerm}"`);
    fetchSearchResults(searchTerm);
  };

  const handleSortChange = (event, newSortOrder) => {
    if (newSortOrder) {
      setSortOrder(newSortOrder);
      if (displayMode === 'discover') {
        const catName = selectedCategory === 'all' ? 'All Categories' : selectedCategory;
        const sortName = newSortOrder.charAt(0).toUpperCase() + newSortOrder.slice(1);
        setDisplayTitle(`${sortName} in ${catName}`);
        fetchDiscoverData(selectedCategory, newSortOrder);
      }
    }
  };

  const handleCategoryChange = (event, newCategory) => {
    setSearchTerm(''); // Clear search term
    setDisplayMode('discover');
    setSelectedCategory(newCategory);
    const catName = newCategory === 'all' ? 'All Categories' : newCategory;
    const sortName = sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1);
    setDisplayTitle(`${sortName} in ${catName}`);
    fetchDiscoverData(newCategory, sortOrder);
  };
  
  const handlePodcastSelect = (podcast) => {
    if (podcast.url) {
      navigate('/podcast-channel', { state: { rssUrl: podcast.url } });
    } else {
      console.error("Podcast does not have a valid RSS feed URL.");
    }
  };

  return (
    <PodcastSearchView
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
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
    />
  );
});

export default PodcastSearchPresenter;