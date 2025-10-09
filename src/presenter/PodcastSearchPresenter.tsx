// src/presenter/PodcastSearchPresenter.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PodcastSearchView } from '../views/PodcastSearchView'; // 确保这个导入路径正确
import { observer } from 'mobx-react-lite';

const recommendedSearchTerms = ['technology', 'history', 'science', 'comedy', 'news', 'storytelling'];

type Props = {
  model: any;
};

const PodcastSearchPresenter = observer(function PodcastSearchPresenter({ model }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/podcasts/search?q=${encodeURIComponent(term)}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      setError('Failed to fetch podcasts. The API might be down or your search term returned no results.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    const randomTerm = recommendedSearchTerms[Math.floor(Math.random() * recommendedSearchTerms.length)];
    setSearchTerm(randomTerm);
    performSearch(randomTerm);
  }, [performSearch]);

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    performSearch(searchTerm);
  };

  const handlePodcastSelect = (podcast: any) => {
    if (podcast.url) {
      navigate('/podcast-channel', { state: { rssUrl: podcast.url } });
    } else {
      setError('This podcast does not have a valid RSS feed URL.');
    }
  };

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
    />
  );
});export default PodcastSearchPresenter;