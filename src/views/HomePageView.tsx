// src/views/HomePageView.tsx
import React from 'react';
import "../styles/HomePage.css";
import { TopNav } from "../components/TopNav";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  CardActionArea,
} from "@mui/material";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from "@mui/icons-material/Favorite";
import Logo from "/asset/LOGO.svg";
import { CollapseBox } from "../components/CollapseBox"; 

type PodcastCardProps = {
  podcast: any;
  onSelect: (podcast: any) => void;
  loading?: boolean;
};

// 简单的 HTML 标签清理与截断
function stripHtml(input?: string, maxLen: number = 180): string {
  if (!input) return "";
  const text = input.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}

// 可复用的播客卡片组件（统一高度与比例）
const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onSelect, loading = false }) => {
  const twoLineClamp = {
    display: '-webkit-box', WebkitBoxOrient: 'vertical' as const, WebkitLineClamp: 2, overflow: 'hidden'
  };

  if (loading) {
    return (
      <Card sx={{ width: '100%', height: '100%', borderRadius: 2 }}>
        <Skeleton variant="rectangular" height={180} />
        <CardContent>
          <Skeleton variant="text" width="85%" height={24} />
          <Skeleton variant="text" width="95%" />
          <Skeleton variant="text" width="70%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: 2, 
      boxShadow: 1, 
      transition: 'box-shadow 0.2s', 
      '&:hover': { boxShadow: 4 } 
    }}>
      <CardActionArea onClick={() => onSelect(podcast)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flexGrow: 1 }}>
        <CardMedia
          component="img"
          image={podcast?.image || podcast?.coverImage}
          alt={podcast?.title ?? ''}
          sx={{ width: '100%', height: 180, objectFit: 'cover' }}
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            title={podcast?.title}
            sx={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              lineHeight: 1.3,
              minHeight: '2.6em'
            }}
          >
            {podcast?.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
            sx={{ ...twoLineClamp, mt: 0.5, minHeight: '2.8em' }}
          >
            {stripHtml(podcast?.description)}
                  </Typography>
                </CardContent>
      </CardActionArea>
              </Card>
  );
};

type HomePageViewProps = {
  url: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  discoverUrl: string;
  onDiscoverInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTopSubmit: () => void;
  onDiscoverSubmit: () => void;
  onRssLinkClick: (event: React.MouseEvent, url: string) => void;

  // 搜索/结果
  isSearching: boolean;
  searchResults: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  errorMsg: string;
  onPodcastSelect: (p: any) => void;

  // 筛选/排序
  sortBy: string;
  onSortChange: (e: any) => void;
  selectedLang: string;
  onLangChange: (e: any) => void;
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (e: any) => void;

  // 其他
  savedPodcasts: any[];
  onSavedPodcastClick: (p: any) => void;
  sentinelRef: React.RefObject<HTMLDivElement>;
  hasMore: boolean;
};

export function HomePageView({
  url, onInputChange, discoverUrl, onDiscoverInputChange, onTopSubmit, onDiscoverSubmit, onRssLinkClick,
  isSearching, searchResults, isLoading, isLoadingMore, errorMsg, onPodcastSelect,
  sortBy, onSortChange, selectedLang, onLangChange, categories, selectedCategory, onCategoryChange,
  savedPodcasts, onSavedPodcastClick, sentinelRef, hasMore
}: HomePageViewProps) {

  const languages = [
    { code: 'en', name: 'English' }, { code: 'sv', name: 'Svenska' },
    { code: 'de', name: 'Deutsch' }, { code: 'es', name: 'Español' },
  ];

  return (
    <div className="homepage-container">
      <TopNav hideLogo />

      <div className="page-inner">
      {/* 顶部区域（搜索栏） */}
      <div className="center-content">
        <img src={Logo} alt="Listenary" style={{ width: 200, height: 50, marginBottom: '40px' }} />
        <Box component="form" onSubmit={(e) => { e.preventDefault(); onTopSubmit(); }} sx={{ display: 'flex', gap: 1, width: '100%', maxWidth: 600 }}>
          <TextField
            fullWidth variant="outlined" placeholder="Search podcasts or paste RSS feed"
            value={url} onChange={onInputChange}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "30px" } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><PodcastsIcon color="action" /></InputAdornment> }}
          />
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ borderRadius: "30px", px: 4 }}>
            {isLoading ? '...' : 'Go'}
          </Button>
          </Box>
        {errorMsg && <Typography color="error" sx={{ mt: 1, maxWidth: 600 }}>{errorMsg}</Typography>}
        
        {/* RSS 使用指南 */}
        <div className="help-link-wrapper">
          <CollapseBox title="How to use Listenary">
            <ol className="rss-guide-list">
              <li>
                Use <a
                  href="https://castos.com/tools/find-podcast-rss-feed/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Castos RSS Finder 
                </a> to search for a podcast, copy the RSS link, and paste it into
                the Parse box.
              </li>
              <li>Click Parse, then select the episode you want. </li>
              <li>
                Or try this link now! <a href="#"
                  className="example-rss-link"
                  onClick={(event) => {
                    onRssLinkClick(
                      event,
                      "https://feeds.captivate.fm/one-minute-podcast-tips/"
                    );
                  }}
                >
                  One Minute Podcast Tips.
                </a> Enjoy it!
              </li>
            </ol>
          </CollapseBox>
        </div>
      </div>

      {/* 结果与筛选区域 */}
      <Box className="discover-section" sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
          Discover New Podcasts
        </Typography>

        {/* Discover 内的搜索框（与顶部一致的交互） */}
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); onDiscoverSubmit(); }}
            sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            width: '100%',
            maxWidth: { xs: 640, sm: 760, md: 880, lg: 980 },
          }}
        >
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search podcasts by title, author, or category..."
            value={discoverUrl}
            onChange={onDiscoverInputChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
          />
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ px: 3.5, borderRadius: '999px' }}>
            Search
          </Button>
        </Box>
        {/* 筛选与排序 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 3, mt: 1, alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Sort By</Typography>
            <FormControl fullWidth variant="outlined" size="small">
              <Select value={sortBy} onChange={onSortChange} displayEmpty>
                <MenuItem value="trending">Trending</MenuItem>
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="updated">Recently Updated</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Language</Typography>
            <FormControl fullWidth variant="outlined" size="small">
              <Select value={selectedLang} onChange={onLangChange} displayEmpty>
                {languages.map(lang => <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Category</Typography>
            <FormControl fullWidth variant="outlined" size="small">
              <Select value={selectedCategory} onChange={onCategoryChange} displayEmpty>
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat: any) => <MenuItem key={cat.id ?? cat.name} value={cat.name}>{cat.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* 结果网格：中等屏幕4列，固定卡片宽度 */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          }, 
          gap: 2.5
        }}>
          {(isLoading && searchResults.length === 0 ? Array.from(new Array(8)) : searchResults).map((podcast: any, index: number) => (
            <Box key={podcast?.id || index} sx={{ minWidth: 0, width: '100%' }}>
              <PodcastCard podcast={podcast} onSelect={onPodcastSelect} loading={isLoading && searchResults.length === 0} />
            </Box>
          ))}
        </Box>

        {/* 加载更多骨架 */}
        {isLoadingMore && (
          <Box sx={{ 
            mt: 1, 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)', 
              lg: 'repeat(4, 1fr)' 
            }, 
            gap: 2.5
          }}>
            {Array.from(new Array(4)).map((_, index) => (
              <Box key={`skel-${index}`} sx={{ minWidth: 0, width: '100%' }}>
                <PodcastCard podcast={null as any} onSelect={() => {}} loading={true} />
              </Box>
            ))}
          </Box>
        )}

        {/* 触底加载哨兵 */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {!isLoading && !hasMore && searchResults.length > 0 && (
          <Typography align="center" color="text.secondary" sx={{ my: 4 }}>
            No more results.
          </Typography>
        )}

        {!isLoading && searchResults.length === 0 && (
          <Box textAlign="center" my={5}>
            <Typography variant="h6" color="text.secondary">
              {sortBy === 'trending' ? 'Showing trending podcasts. Use the search bar to find more.' : 'No results found. Try a different search!'}
            </Typography>
          </Box>
        )}

        {/* 已保存的播客（非搜索模式） */}
        {!isSearching && savedPodcasts && savedPodcasts.length > 0 && (
          <div className="saved-section">
            <div className="saved-header">
              <Typography variant="h5" component="h2" className="saved-title"><FavoriteIcon className="saved-icon" /> Saved Podcasts</Typography>
            </div>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)', 
                lg: 'repeat(4, 1fr)' 
              }, 
              gap: 3
            }}>
              {savedPodcasts.slice(0, 4).map((podcast: any, index: number) => (
                <Box key={index} sx={{ minWidth: 0, width: '100%' }}>
                  <PodcastCard podcast={podcast} onSelect={onSavedPodcastClick} />
                </Box>
              ))}
            </Box>
          </div>
        )}
      </Box>
      </div>
    </div>
  );
}
