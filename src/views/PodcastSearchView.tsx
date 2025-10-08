// src/views/PodcastSearchView.tsx

import React from 'react';
import { TopNav } from '../components/TopNav';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  // 我们不再需要从 @mui/material 导入 Grid 了
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Props 类型定义保持不变
type Props = {
  searchTerm: string;
  onSearchTermChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent) => void;
  searchResults: any[];
  isLoading: boolean;
  error: string | null;
  onPodcastSelect: (podcast: any) => void;
  hasSearched: boolean;
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
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopNav />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Discover New Podcasts
        </Typography>

        {/* 搜索框部分保持不变 */}
        <Box
          component="form"
          onSubmit={onSearchSubmit}
          sx={{ display: 'flex', gap: 2, mb: 4 }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for podcasts by title, author, or category..."
            value={searchTerm}
            onChange={onSearchTermChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ px: 4 }}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        {/* 结果区域 */}
        <Box>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {!isLoading && !error && (
            // --- 这是修改的核心部分 ---
            // 我们用一个 Box 替代了 Grid container
            <Box sx={{
              display: 'grid',
              // 这一行是关键：它创建了一个响应式的列布局
              // auto-fill: 自动填充尽可能多的列
              // minmax(250px, 1fr): 每列最小宽度为250px，最大为1个弹性单位（自动均分）
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 3, // 替代了 spacing={3}
            }}>
              {searchResults.map((podcast) => (
                // 不再需要 Grid item 包装器，Card 本身就是 Grid 的子项
                <Card
                  key={podcast.id} // 将 key 直接放在 Card 上
                  sx={{ height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}
                  onClick={() => onPodcastSelect(podcast)}
                >
                  <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={podcast.image}
                      alt={podcast.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" noWrap title={podcast.title}>
                        {podcast.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap title={podcast.author}>
                        by {podcast.author}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
            // --- 修改结束 ---
          )}
          
          {hasSearched && !isLoading && searchResults.length === 0 && !error && (
             <Typography sx={{mt: 4, textAlign: 'center', color: 'text.secondary'}}>
                No results found for "{searchTerm}". Try a different search term.
             </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}