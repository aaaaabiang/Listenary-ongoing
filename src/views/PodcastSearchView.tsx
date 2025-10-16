// src/views/PodcastSearchView.tsx

import React from 'react';
import { TopNav } from '../components/TopNav';
import DiscoveryCard from '../components/DiscoveryCard';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

// --- 新增：一个专门用于 Grid 布局的组件 ---
// 这个组件的作用就是创建一个网格项“坑位”
function PodcastGridItem({ children }: { children: React.ReactNode }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      {children}
    </Grid>
  );
}


type Props = {
  searchTerm: string;
  onSearchTermChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent) => void;
  sortOrder: 'trending' | 'recent';
  onSortChange: (event: React.MouseEvent<HTMLElement>, newOrder: string | null) => void;
  categories: { id: string; name: string }[];
  selectedCategory: string | null;
  onCategoryChange: (event: React.SyntheticEvent, newCategory: string) => void;
  displayTitle: string;
  podcasts: any[];
  onPodcastSelect: (podcast: any) => void;
  isLoading: boolean;
  error: string | null;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  sentinelRef?: React.RefObject<HTMLDivElement>;
};

export function PodcastSearchView({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  sortOrder,
  onSortChange,
  categories,
  selectedCategory,
  onCategoryChange,
  displayTitle,
  podcasts,
  onPodcastSelect,
  isLoading,
  error,
  isLoadingMore = false,
  hasMore = false,
  sentinelRef,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopNav />
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        {/* 搜索框 */}
        <Box component="form" onSubmit={onSearchSubmit} sx={{ display: 'flex', gap: 2, maxWidth: 900, mx: 'auto', mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for podcasts by title, author, or category..."
            value={searchTerm}
            onChange={onSearchTermChange}
            InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
          />
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ px: 4 }}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        {/* 切换器与分类导航 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
          <ToggleButtonGroup 
            value={sortOrder} 
            exclusive 
            onChange={onSortChange} 
            aria-label="sort order" 
            size="small"
            disabled={isLoading}
          >
            <ToggleButton value="trending" aria-label="trending">
              <WhatshotIcon sx={{ mr: 1 }} />
              Trending
            </ToggleButton>
            <ToggleButton value="recent" aria-label="recent">
              <NewReleasesIcon sx={{ mr: 1 }} />
              Recent
            </ToggleButton>
          </ToggleButtonGroup>
          <Tabs
            value={selectedCategory}
            onChange={onCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="podcast categories"
            sx={{ flexGrow: 1, ml: 2 }}
          >
            <Tab label="All" value="all" disabled={isLoading} />
            {categories.map((cat) => (
              <Tab key={cat.id} label={cat.name} value={cat.name} disabled={isLoading} />
            ))}
          </Tabs>
        </Box>
        
        {/* 状态区域 */}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        {/* 动态内容网格 */}
        <Box>
          <Typography variant="h5" fontWeight="600" gutterBottom>{displayTitle}</Typography>
          <Grid container spacing={3}>
            {isLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <PodcastGridItem key={index}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <Skeleton variant="rectangular" height={160} />
                    <CardContent>
                      <Skeleton variant="text" width="80%" height={28} />
                      <Skeleton variant="text" width="60%" />
                    </CardContent>
                  </Card>
                </PodcastGridItem>
              ))
            ) : podcasts.length > 0 ? (
              podcasts.map((podcast) => (
                <PodcastGridItem key={podcast.id}>
                  <DiscoveryCard item={podcast} onSelect={onPodcastSelect} />
                </PodcastGridItem>
              ))
            ) : (
              !error && (
                <Grid item xs={12}>
                  <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
                    No podcasts found. Try a different search or category.
                  </Typography>
                </Grid>
              )
            )}
          </Grid>

          {/* 无限滚动逻辑 (保持不变) */}
          {isLoadingMore && (
            <Grid container spacing={3} sx={{ mt: 0 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <PodcastGridItem key={`sk-more-${i}`}>
                   <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <Skeleton variant="rectangular" height={160} />
                    <CardContent>
                      <Skeleton variant="text" width="80%" height={28} />
                      <Skeleton variant="text" width="60%" />
                    </CardContent>
                  </Card>
                </PodcastGridItem>
              ))}
            </Grid>
          )}
          <div ref={sentinelRef} style={{ height: 1 }} />
          {!isLoading && podcasts.length > 0 && !hasMore && (
            <Typography align="center" color="text.secondary" sx={{ my: 3 }}>
              No more results.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}