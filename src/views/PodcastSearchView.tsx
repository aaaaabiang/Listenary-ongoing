// src/views/PodcastSearchView.tsx

import React from 'react';
import { TopNav } from '../components/TopNav';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

// 播客卡片组件
function PodcastCard({ podcast, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card sx={{ borderRadius: 3 }}>
          <Skeleton variant="rectangular" height={180} />
          <CardContent>
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="60%" />
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        sx={{ height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 }, borderRadius: 3 }}
        onClick={() => onSelect(podcast)}
      >
        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <CardMedia
            component="img"
            height="180"
            image={podcast.image || '/placeholder-image.png'}
            alt={podcast.title}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" noWrap title={podcast.title}>
              {podcast.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap title={podcast.author}>
              by {podcast.author}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}

// 主视图组件
export function PodcastSearchView({
  searchTerm,
  onSearchChange,
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
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopNav />
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        {/* 搜索框 */}
        <Box component="form" onSubmit={onSearchSubmit} sx={{ display: 'flex', gap: 2, maxWidth: 900, mx: 'auto', mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for your favorite podcasts..."
            value={searchTerm}
            onChange={onSearchChange}
            InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
          />
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ px: 4 }}>
            Search
          </Button>
        </Box>

        {/* 切换器与分类导航 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
          <ToggleButtonGroup value={sortOrder} exclusive onChange={onSortChange} aria-label="sort order" size="small">
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
            <Tab label="All" value="all" />
            {categories.map((cat) => (
              <Tab key={cat.id} label={cat.name} value={cat.name} />
            ))}
          </Tabs>
        </Box>

        {/* 动态内容网格 */}
        <Box>
          <Typography variant="h5" fontWeight="600" gutterBottom>{displayTitle}</Typography>
          {isLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 12 }).map((_, index) => (
                <PodcastCard key={index} podcast={null} onSelect={() => {}} isLoading={true} />
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {podcasts.map((podcast) => (
                <PodcastCard key={podcast.id} podcast={podcast} onSelect={onPodcastSelect} isLoading={false} />
              ))}
            </Grid>
          )}
          {!isLoading && podcasts.length === 0 && (
            <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
              No podcasts found. Try a different search or category.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}