// src/components/DiscoveryCard.tsx

import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Chip,
  Box,
} from '@mui/material';

type PodcastItem = {
  id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
  content?: string;
  author?: string;
  publisher?: string;
  artist?: string;
  owner?: string;
  image?: string;
  artwork?: string;
  cover?: string;
  thumbnail?: string;
  url?: string;
  categories?: string[];
  genre?: string[];
  tags?: string[];
};

type Props = {
  item: PodcastItem;
  onSelect: (item: PodcastItem) => void;
};

function stripHtml(input: string = '') {
  return input.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s+/g, ' ').trim();
}
function pickImage(item: PodcastItem) {
  return item.image || item.artwork || item.cover || item.thumbnail || '';
}
function pickAuthor(item: PodcastItem) {
  return item.author || item.publisher || item.artist || item.owner || '';
}
function pickDescription(item: PodcastItem) {
  const raw = item.description || item.summary || item.content || '';
  return stripHtml(raw);
}

export default function DiscoveryCard({ item, onSelect }: Props) {
  const title = item.title || item.name || 'Untitled';
  const author = pickAuthor(item);
  const description = pickDescription(item);
  const cover = pickImage(item);
  const tagList = item.categories || item.genre || item.tags || [];

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2.4,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transformOrigin: 'center center',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: 2,
        },
      }}
    >
      <CardActionArea
        onClick={() => onSelect(item)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          height: '100%',
        }}
      >
        {/* 封面保持方形 */}
        <Box
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            flexShrink: 0,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          {cover ? (
            <CardMedia
              component="img"
              image={cover}
              alt={title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
              loading="lazy"
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'action.hover' }} />
          )}
        </Box>

        {/* ✅ 文字内容更紧凑 */}
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            width: '100%',
            p: 1.8, // 原来2.5，减少间距
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontWeight: 700,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.3,
              }}
            >
              {title}
            </Typography>

            {author && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 0.6,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {author}
              </Typography>
            )}

            {description && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3, 
                  lineHeight: 1.4,
                  minHeight: '4.2em', // 约三行高度，确保底部齐平
                }}
                title={description}
              >
                {description}
              </Typography>
            )}
          </Box>

          {/* 标签贴底浅蓝 */}
          {tagList.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 1 }}
            >
              {tagList.slice(0, 6).map((tag, idx) => (
                <Chip
                  key={`${tag}-${idx}`}
                  label={tag}
                  size="small"
                  sx={{
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(33,150,243,0.15)', // 浅蓝底
                    color: 'rgb(25,118,210)', // 主色
                    border: 'none',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
