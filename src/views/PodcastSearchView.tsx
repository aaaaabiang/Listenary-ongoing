// src/views/PodcastSearchView.tsx
import React from 'react';
import { TopNav } from '../components/TopNav';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type Props = {
  searchTerm: string;
  onSearchTermChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent) => void;
  searchResults: any[];
  isLoading: boolean;
  error: string | null;
  onPodcastSelect: (podcast: any) => void;
  hasSearched: boolean;

  // 👇 新增，用于无限滚动
  isLoadingMore?: boolean;
  hasMore?: boolean;
  sentinelRef?: React.RefObject<HTMLDivElement>;
  pageSize?: number;
};

export function PodcastSearchView({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  searchResults,
  isLoading,
  error,
  onPodcastSelect,
  hasSearched,

  // 新增 props 的默认值
  isLoadingMore = false,
  hasMore = false,
  sentinelRef,
  pageSize = 20,
}: Props) {
  // 通用两行截断样式
  const twoLineClamp = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    WebkitLineClamp: 2,
    overflow: 'hidden',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopNav />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Discover New Podcasts
        </Typography>

        {/* 搜索栏 */}
        <Box component="form" onSubmit={onSearchSubmit} sx={{ display: 'flex', gap: 2, mb: 4 }}>
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

        {/* 状态区域 */}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {/* 结果区域 */}
        <Box>
          {/* 初次加载：你原来是圆圈加载，这里保留；也可以换成骨架卡片 */}
          {isLoading && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 3 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={`sk-init-${i}`} sx={{ borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={180} sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" />
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {!isLoading && !error && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 3,
              }}
            >
              {searchResults.map((podcast, idx) => (
                <Card
                  key={podcast.id || podcast.url || idx}
                  sx={{ height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}
                  onClick={() => onPodcastSelect(podcast)}
                >
                  <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={podcast.image || '/placeholder-16x9.png'}
                      alt={podcast.title}
                      sx={{ objectFit: 'cover' }}
                      loading="lazy"
                      decoding="async"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* 长标题：两行截断 + title 提示完整 */}
                      <Typography variant="h6" component="div" sx={{ ...twoLineClamp }} title={podcast.title} gutterBottom>
                        {podcast.title}
                      </Typography>

                      {/* 作者 */}
                      {podcast.author && (
                        <Typography variant="body2" color="text.secondary" title={podcast.author} sx={{ mb: 1 }}>
                          by {podcast.author}
                        </Typography>
                      )}

                      {/* 简介两行摘要 */}
                      {podcast.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ ...twoLineClamp, mb: 1 }}>
                          {podcast.description}
                        </Typography>
                      )}

                      {/* 额外信息：分类/集数/更新时间（后端有就显示） */}
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {!!podcast.categories?.length &&
                          podcast.categories.slice(0, 3).map((c: string, i: number) => (
                            <Chip key={i} size="small" label={c} variant="outlined" />
                          ))}
                        {typeof podcast.episodesCount === 'number' && (
                          <Chip size="small" label={`Episodes: ${podcast.episodesCount}`} />
                        )}
                        {podcast.lastUpdated && (
                          <Chip
                            size="small"
                            label={`Updated: ${new Date(podcast.lastUpdated).toLocaleDateString()}`}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          )}

          {/* 没结果 */}
          {hasSearched && !isLoading && searchResults.length === 0 && !error && (
            <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
              No results found for "{searchTerm}". Try a different search term.
            </Typography>
          )}

          {/* 加载更多骨架（分页中） */}
          {!isLoading && isLoadingMore && (
            <Box
              sx={{
                mt: 2,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 3,
              }}
            >
              {Array.from({ length: Math.max(2, Math.min(4, Math.floor(pageSize / 2))) }).map((_, i) => (
                <Card key={`sk-more-${i}`} sx={{ borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={180} sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* 触底哨兵（必须存在于页面上，Presenter 会观测它） */}
          <div ref={sentinelRef as React.RefObject<HTMLDivElement>} style={{ height: 1 }} />

          {/* 没有更多了（可选提示） */}
          {!isLoading && !isLoadingMore && hasSearched && searchResults.length > 0 && !hasMore && (
            <Typography align="center" color="text.secondary" sx={{ my: 3 }}>
              No more results.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}
