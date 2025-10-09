// src/views/PodcastChannelView.tsx
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

// ==== EpisodeCard（支持 loading）====
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
    <Card
      sx={{
        p: 2,
        width: "100%",
        borderRadius: 3,
        transition: "background-color 0.3s",
        "&:hover": { backgroundColor: "#f5f5f5" },
        maxWidth: "100%",
      }}
      elevation={1}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          width: "100%",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flex: 1, minWidth: 0 }}>
          {/* 封面：loading 时不渲染 <img>，只用 Skeleton 占位（100x100） */}
          {loading ? (
            <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 2 }} />
          ) : (
            <CardMedia
              component="img"
              image={
                episode.coverImage ||
                "https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Episode%20Cover.svg?alt=media&token=5e5257bc-23e1-4db9-8342-a89502538bd0"
              }
              alt={episode.title}
              sx={{ width: 100, height: 100, borderRadius: 2 }}
            />
          )}

          <CardContent sx={{ p: 0, flex: 1, minWidth: 0 }}>
            {/* 标题 */}
            {loading ? (
              <Skeleton variant="text" height={28} width="70%" />
            ) : (
              <Typography
                variant="h6"
                sx={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                  lineHeight: 1.4,
                }}
              >
                {episode.title}
              </Typography>
            )}

            {/* 描述 */}
            {loading ? (
              <>
                <Skeleton variant="text" height={20} width="95%" sx={{ mt: 1 }} />
                <Skeleton variant="text" height={20} width="85%" />
              </>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                mt={1}
                sx={{
                  ...(expanded
                    ? {}
                    : {
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }),
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  lineHeight: 1.4,
                }}
              >
                {episode.description}
              </Typography>
            )}

            {/* 展开/收起 */}
            {!loading && isClamped && (
              <Link
                component="button"
                variant="body2"
                onClick={() => setExpanded(!expanded)}
                sx={{ mt: 0.5, pl: 0, textTransform: "none" }}
              >
                {expanded ? "Show less" : "Show more"}
              </Link>
            )}

            {/* 时长 */}
            {loading ? (
              <Skeleton variant="text" height={16} width={120} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                🎧 {episode.duration}
              </Typography>
            )}
          </CardContent>
        </Box>

        {/* 右侧按钮 */}
        <Box
          sx={{
            minWidth: 100,
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={handlePlay}
              color={episode.isTranscribed ? "success" : "primary"}
            >
              {episode.isTranscribed ? "Continue" : "Learn"}
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}

// ==== 主视图（支持 loading）====
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
  loading = false, // 👈 新增
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
  const [visibleCount, setVisibleCount] = useState(10);
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

  // loading 时，用固定条数的占位，不请求图片、不显示真实文字
  const displayEpisodes = loading ? Array.from({ length: 8 }, () => ({})) : episodes;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <TopNav />

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 4, pt: 4 }}>
        {/* Channel info */}
        <Box display="flex" gap={5} flexWrap="wrap" alignItems="flex-start" width="100%">
          <Card sx={{ width: 200, height: 200, borderRadius: 4, boxShadow: 3, position: "relative" }}>
            {/* 封面：loading 时不渲染 <img>，用 Skeleton */}
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 4 }} />
            ) : (
              <CardMedia
                component="img"
                image={channelInfo.coverImage}
                alt={channelInfo.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </Card>

          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            gap={2}
            justifyContent="flex-start"
            maxWidth={{ xs: "100%", md: "calc(100% - 240px)" }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              {/* 标题 */}
              {loading ? (
                <Skeleton variant="text" height={40} width="60%" />
              ) : (
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {channelInfo.title}
                </Typography>
              )}

              <Box ml={2}>
                {/* 保存按钮占位 */}
                {loading ? (
                  <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 2 }} />
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    color={isSaved ? "success" : "primary"}
                    onClick={handleSubscribe}
                    startIcon={<FavoriteIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                )}
              </Box>
            </Box>

            {/* 描述 */}
            {loading ? (
              <>
                <Skeleton variant="text" height={20} width="90%" />
                <Skeleton variant="text" height={20} width="70%" />
              </>
            ) : (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={
                  descExpanded
                    ? {}
                    : {
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                      }
                }
              >
                <span dangerouslySetInnerHTML={{ __html: channelInfo.description }} />
              </Typography>
            )}

            {!loading && descClamped && (
              <Link
                component="button"
                variant="body2"
                onClick={() => setDescExpanded(!descExpanded)}
                sx={{ textTransform: "none", alignSelf: "flex-start" }}
              >
                {descExpanded ? "Show less" : "Show more"}
              </Link>
            )}
          </Box>
        </Box>

        {/* Filters / Episode list */}
        <Box mt={6}>
          {/* Filter 行：loading 时用矩形占位，避免位移 */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            {loading ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="rectangular" width={110} height={32} sx={{ borderRadius: 16 }} />
                <Skeleton variant="rectangular" width={140} height={32} sx={{ borderRadius: 16 }} />
                <Skeleton variant="rectangular" width={160} height={32} sx={{ borderRadius: 16 }} />
              </Box>
            ) : (
              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={handleFilterChange}
                aria-label="Episode Filter"
                size="small"
              >
                <ToggleButton value="all" aria-label="All">
                  All Episodes
                </ToggleButton>
                <ToggleButton value="untranscribed" aria-label="Untranscribed">
                  New Episodes
                </ToggleButton>
                <ToggleButton value="transcribed" aria-label="Transcribed">
                  Learned Episodes
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>

          {/* 列表 */}
          <Box display="flex" flexDirection="column" gap={2}>
            {displayEpisodes.slice(0, visibleCount).map((episode: any, index: number) => (
              <EpisodeCard
                key={episode?.guid || index}
                episode={episode}
                onPlay={onPlay}
                showSnackbar={showSnackbar}
                loading={loading}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={(event) => handleClose(event, undefined)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
