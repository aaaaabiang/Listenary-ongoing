import React from 'react';
import { TopNav } from '../components/TopNav';
import DiscoveryCard from '../components/DiscoveryCard';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { styled, alpha } from '@mui/material/styles'

//Toggle group
const Capsule = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: 9999,
  padding: 4, 
  gap: 0,
}));

const PillBtn = styled(ToggleButton)(({ theme }) => ({
  border: 1,
  borderRadius: 9999,
  textTransform: 'none',
  padding: '12px 24px',        // 按钮内部左右留白
  lineHeight: 1,
  height: 40,
  fontSize: '0.95rem',         
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
  },
}));

// 扩展后的 Props 类型
type Props = {
  // 用于搜索
  searchTerm: string;
  onSearchTermChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent) => void;
  
  // 用于发现/浏览
  sortOrder: 'trending' | 'recent';
  onSortChange: (event: React.MouseEvent<HTMLElement>, newOrder: string | null) => void;
  categories: { id: string; name: string }[];
  selectedCategory: string | false;
  onCategoryChange: (event: React.SyntheticEvent, newCategory: string) => void;
  
  // 用于展示
  displayTitle: string;
  podcasts: any[];
  onPodcastSelect: (podcast: any) => void;
  isLoading: boolean;
  error: string | null;

  // 用于无限滚动 (保持不变)
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

        <Box
          sx={{
            mb: 2,        
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
            }}
        >
        <Box sx={{ display: 'inline-flex' }}>
          <Capsule
            value={sortOrder}
            exclusive
            onChange={onSortChange}
            aria-label="sort order"
            size="small"
            disabled={isLoading}
          >
            <PillBtn value="trending" aria-label="trending">
              <WhatshotIcon sx={{ mr: 1 }} />
              Trending
            </PillBtn>
            <PillBtn value="recent" aria-label="recent">
              <NewReleasesIcon sx={{ mr: 1 }} />
              Recent
            </PillBtn>
          </Capsule>
        </Box>
        </Box>
        <Tabs
          value={(selectedCategory || 'all').toLowerCase()}
          onChange={onCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="podcast categories"
          TabIndicatorProps={{ sx: { display: 'none' } }}
          sx={(theme) => ({
            flexGrow: 1,
            ml: 2,
            px: 0.5,
            // 滚动按钮样式（含右侧按钮垂直居中）
            '& .MuiTabs-scrollButtons': {
              alignSelf: 'center',         // ✅ 垂直居中
              height: 40,
              width: 40,
              borderRadius: '50%',
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.Mui-disabled': {
                opacity: 0.3,
              },
            },
            // Tab 样式
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 44,
              height: 44,
              lineHeight: 1,
              borderRadius: '9999px',
              mr: 1,
              px: 1.5,
              fontSize: '0.95rem',         // ✅ 字体更大
              fontWeight: 500,
              color: theme.palette.text.secondary,
              transition: 'background-color .2s ease, color .2s ease',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.Mui-focusVisible': {
                boxShadow: `0 0 0 3px ${theme.palette.primary.main}40`,
              },
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 700,
                backgroundColor: `${theme.palette.primary.main}1F`, // ~12% 透明
              },
            },
          })}
        >
          <Tab label="All" value="all" disabled={isLoading && (selectedCategory || 'all').toLowerCase() !== 'all'} />
          {categories.map((cat) => {
            const val = cat.name.toLowerCase();
            const isSelected = (selectedCategory || 'all').toLowerCase() === val;
            return (
              <Tab
                key={cat.id}
                label={cat.name}
                value={val}
                disabled={isLoading && !isSelected}
              />
            );
          })}
        </Tabs>

        </Box>
        
        {/* 状态区域 */}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        {/* 动态内容网格 */}
        <Box>
          <Typography variant="h5" fontWeight="600" gutterBottom>{displayTitle}</Typography>
          
          <Box
            sx={{
              display: 'grid',
              // gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 2,
              alignItems: 'stretch',
            }}
          >
            {isLoading ? (
              // 加载状态：渲染骨架图
              Array.from({ length: 12 }).map((_, index) => (
                <Card sx={{ borderRadius: 3 }} key={index}>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              ))
            ) : podcasts.length > 0 ? (
              // 有数据：渲染真实的 DiscoveryCard
              podcasts.map((podcast) => (
                <DiscoveryCard key={podcast.id} item={podcast} onSelect={onPodcastSelect} />
              ))
            ) : (
              // 无数据状态（但需要一个 Grid 容器来保持布局一致性）
              !error && (
                <Typography sx={{ gridColumn: '1 / -1', mt: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No podcasts found. Try a different search or category.
                </Typography>
              )
            )}

            {/* 无限滚动加载更多时的骨架图 */}
            {isLoadingMore && (
              Array.from({ length: 4 }).map((_, i) => (
                <Card sx={{ borderRadius: 3 }} key={`sk-more-${i}`}>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
          
          {/* 无限滚动哨兵和“没有更多”提示 (保持不变) */}
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