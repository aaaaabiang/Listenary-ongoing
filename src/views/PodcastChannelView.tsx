// src/views/PodcastChannelView.tsx (最终布局修正版)

import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Alert,
  Skeleton,
} from "@mui/material";
import { TopNav } from "../components/TopNav";
import React, { useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";

// 辅助函数：确保图片URL是字符串类型
function normalizeImageUrl(imageData: any): string {
  const defaultImage = "https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Podcast.svg?alt=media&token=9ad09cc3-2199-436a-b1d5-4eb1a866b3ea";
  
  if (!imageData) return defaultImage;
  
  // 如果是数组，取第一个元素
  if (Array.isArray(imageData)) {
    return imageData[0] || defaultImage;
  }
  
  // 如果是字符串且是有效的URL，直接使用
  if (typeof imageData === 'string' && imageData.startsWith('http')) {
    return imageData;
  }
  
  // 否则返回默认图片
  return defaultImage;
}

// ==== EpisodeCard 子组件 (无需修改) ====
function EpisodeCard({
  episode,
  onPlay,
  showSnackbar,
  loading = false,
}: {
  episode: any;
  onPlay: (ep: any) => void;
  showSnackbar?: (msg: string, sev?: "success" | "info" | "warning" | "error") => void;
  loading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isClamped = episode?.description?.length > 180;

  function handlePlay() {
    if (!episode?.enclosure?.url) {
      showSnackbar?.("This episode has no playable audio file", "warning");
      return;
    }
    onPlay(episode);
  }

  return (
    <Card sx={{ p: 2, width: "100%", borderRadius: 3, transition: "background-color 0.3s", "&:hover": { backgroundColor: "#f5f5f5" }, maxWidth: "100%" }} elevation={1}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", width: "100%", gap: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flex: 1, minWidth: 0 }}>
          {loading ? ( <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 2 }} /> ) : (
            <CardMedia component="img" image={normalizeImageUrl(episode.image)} alt={episode.title} sx={{ width: 100, height: 100, borderRadius: 2 }} referrerPolicy="no-referrer" />
          )}
          <CardContent sx={{ p: 0, flex: 1, minWidth: 0 }}>
            {loading ? ( <Skeleton variant="text" height={28} width="70%" /> ) : ( <Typography variant="h6" sx={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden", textOverflow: "ellipsis", wordBreak: "break-word", lineHeight: 1.4 }}>{episode.title}</Typography> )}
            {loading ? ( <><Skeleton variant="text" height={20} width="95%" sx={{ mt: 1 }} /><Skeleton variant="text" height={20} width="85%" /></> ) : ( <Typography variant="body2" color="text.secondary" mt={1} sx={{ ...(expanded ? {} : { display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }), overflowWrap: "break-word", wordBreak: "break-word", lineHeight: 1.4 }}>{episode.description}</Typography> )}
            {!loading && isClamped && ( <Link component="button" variant="body2" onClick={() => setExpanded(!expanded)} sx={{ mt: 0.5, pl: 0, textTransform: "none" }}>{expanded ? "Show less" : "Show more"}</Link> )}
            {loading ? ( <Skeleton variant="text" height={16} width={120} sx={{ mt: 1 }} /> ) : ( <Typography variant="caption" color="text.secondary" mt={1} display="block">🎧 {episode.duration}</Typography> )}
          </CardContent>
        </Box>
        <Box sx={{ minWidth: 100, flexShrink: 0, display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
          {loading ? ( <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} /> ) : ( <Button variant="contained" size="small" onClick={handlePlay} color={episode.isTranscribed ? "success" : "primary"}>{episode.isTranscribed ? "Continue" : "Learn"}</Button> )}
        </Box>
      </Box>
    </Card>
  );
}

// ==== 主视图 ====
export function PodcastChannelView({
  channelInfo,
  episodes,
  isSaved,
  onSavePodcast,
  onRemovePodcast,
  onPlay,
  filterType,
  onFilterChange,
  snackbarState,
  onSnackbarClose,
  loading = false,
}: {
  channelInfo: any;
  episodes: any[];
  isSaved?: boolean;
  onSavePodcast: (c: any) => any;
  onRemovePodcast: (c: any) => any;
  onPlay: (e: any) => void;
  filterType: string;
  onFilterChange: (e: any, v: string) => void;
  snackbarState?: any;
  onSnackbarClose?: any;
  loading?: boolean;
}) {
  // const [visibleCount, setVisibleCount] = useState(10);
  const [descExpanded, setDescExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "warning" | "error">("success");

  function showSnackbar(message: string, severity: "success" | "info" | "warning" | "error" = "success") {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpen(true);
  }

  const descClamped = channelInfo?.description?.length > 180;

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") return;
    setOpen(false);
  }

  function handleSubscribe() {
    const result = isSaved ? onRemovePodcast(channelInfo) : onSavePodcast(channelInfo);
    if (result && result.type === "warning") {
      showSnackbar(result.message, result.type);
    } else {
      showSnackbar(isSaved ? "Podcast removed from saved list" : "Podcast saved successfully", "success");
    }
  }

  function handleFilterChange(event: any, newFilterType: string | null) {
    if (newFilterType !== null) onFilterChange(event, newFilterType);
  }

  const displayEpisodes = loading ? Array.from({ length: 8 }, () => ({})) : episodes;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <TopNav />
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 4, pt: 4 }}>
        {/* ==================== 布局修改处 ==================== */}
        <Box 
          display="flex" 
          gap={5} 
          // 使用响应式 flexDirection 代替 flexWrap
          flexDirection={{ xs: 'column', md: 'row' }} 
          alignItems="flex-start" 
          width="100%"
        >
        {/* ======================================================= */}
          <Card sx={{ width: 200, height: 200, borderRadius: 4, boxShadow: 3, position: "relative", flexShrink: 0 }}>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 4 }} />
            ) : (
              <CardMedia
                component="img"
                // 修正: 使用 'coverImage' 字段（与Model.ts中的字段名一致）
                // 添加类型保护：确保image属性始终是字符串
                image={normalizeImageUrl(channelInfo.coverImage)}
                alt={channelInfo.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                referrerPolicy="no-referrer"
              />
            )}
          </Card>
          <Box flex={1} display="flex" flexDirection="column" gap={2} justifyContent="flex-start" minWidth={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              {loading ? ( <Skeleton variant="text" height={40} width="60%" /> ) : ( <Typography variant="h4" fontWeight={700} color="text.primary">{channelInfo.title}</Typography> )}
              <Box ml={2}>
                {loading ? ( <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 2 }} /> ) : ( <Button variant="contained" size="small" color={isSaved ? "success" : "primary"} onClick={handleSubscribe} startIcon={<FavoriteIcon />} sx={{ borderRadius: 2 }}>{isSaved ? "Saved" : "Save"}</Button> )}
              </Box>
            </Box>
            {loading ? ( <><Skeleton variant="text" height={20} width="90%" /><Skeleton variant="text" height={20} width="70%" /></> ) : ( <Typography variant="body1" color="text.secondary" sx={ descExpanded ? {} : { display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 3 } }><span dangerouslySetInnerHTML={{ __html: channelInfo.description }} /></Typography> )}
            {!loading && descClamped && ( <Link component="button" variant="body2" onClick={() => setDescExpanded(!descExpanded)} sx={{ textTransform: "none", alignSelf: "flex-start" }}>{descExpanded ? "Show less" : "Show more"}</Link> )}
          </Box>
        </Box>
        <Box mt={6}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            {loading ? ( <Box sx={{ display: "flex", gap: 1 }}><Skeleton variant="rectangular" width={110} height={32} sx={{ borderRadius: 16 }} /><Skeleton variant="rectangular" width={140} height={32} sx={{ borderRadius: 16 }} /><Skeleton variant="rectangular" width={160} height={32} sx={{ borderRadius: 16 }} /></Box> ) : (
              <ToggleButtonGroup value={filterType} exclusive onChange={handleFilterChange} aria-label="Episode Filter" size="small">
                <ToggleButton value="all" aria-label="All">All Episodes</ToggleButton>
                <ToggleButton value="untranscribed" aria-label="Untranscribed">New Episodes</ToggleButton>
                <ToggleButton value="transcribed" aria-label="Transcribed">Learned Episodes</ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            {displayEpisodes.map((episode: any, index: number) => (
              <EpisodeCard key={episode?.guid || index} episode={episode} onPlay={onPlay} showSnackbar={showSnackbar} loading={loading} />
            ))}
          </Box>
        </Box>
      </Box>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={(event) => handleClose(event, undefined)} severity={snackbarSeverity} sx={{ width: "100%" }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}