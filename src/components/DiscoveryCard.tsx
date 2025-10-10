import React from "react";
import {
  Card, CardActionArea, CardContent, CardMedia,
  Typography, Chip, Stack, Tooltip, Box
} from "@mui/material";
import type { PodcastItem } from "../hooks/useInfinitePodcastSearch";

export default function DiscoveryCard({ item, onSelect }: {
  item: PodcastItem; onSelect: (p: PodcastItem) => void;
}) {
  const twoLineClamp = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: 2,
    overflow: "hidden",
  };

  return (
    <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={() => onSelect(item)} sx={{ alignItems: "stretch" }}>
        <CardMedia
          component="img"
          image={item.image || "/placeholder-16x9.png"}
          alt={item.title}
          sx={{ height: 160, objectFit: "cover" }}
          loading="lazy"
          decoding="async"
        />
        <CardContent sx={{ flex: 1 }}>
          {/* 长标题：两行截断 + 悬停 Tooltip 显示完整 */}
          <Tooltip title={item.title} placement="top" arrow>
            <Typography variant="subtitle1" sx={twoLineClamp} gutterBottom>
              {item.title}
            </Typography>
          </Tooltip>

          {/* 作者 */}
          {item.author && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              {item.author}
            </Typography>
          )}

          {/* 简介摘要（最多2行） */}
          {item.description && (
            <Typography variant="body2" color="text.secondary" sx={{ ...twoLineClamp, mb: 1 }}>
              {item.description}
            </Typography>
          )}

          {/* 元信息：集数 / 最近更新 */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
            {typeof item.episodesCount === "number" && (
              <Chip size="small" label={`Episodes: ${item.episodesCount}`} />
            )}
            {item.lastUpdated && (
              <Chip
                size="small"
                label={`Updated: ${new Date(item.lastUpdated).toLocaleDateString()}`}
              />
            )}
          </Box>

          {/* 分类标签（最多显示 3 个） */}
          {!!item.categories?.length && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {item.categories.slice(0, 3).map((c, i) => (
                <Chip key={i} size="small" label={c} variant="outlined" />
              ))}
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
