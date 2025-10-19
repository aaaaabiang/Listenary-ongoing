import "../styles/HomePage.css";
// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import TextField from "@mui/material/TextField";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/TravelExploreOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import { CollapseBox } from "../components/CollapseBox";
import Snackbar from "@mui/material/Snackbar";
import {
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";

import Logo from "/asset/LOGO.svg";

// 你的 RecommendationRow 路径按项目实际调整（这行保持不变）
import RecommendationRow from "../components/RecommendationRow";

// 辅助函数：标准化图片URL
function normalizeImageUrl(imageData: any): string {
  const defaultImage =
    "https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Podcast.svg?alt=media&token=9ad09cc3-2199-436a-b1d5-4eb1a866b3ea";

  if (!imageData) return defaultImage;

  if (typeof imageData === "string" && imageData.startsWith("http")) {
    return imageData;
  }
  if (Array.isArray(imageData) && imageData.length > 0) {
    return normalizeImageUrl(imageData[0]);
  }
  if (typeof imageData === "object" && imageData !== null) {
    if (imageData.url && typeof imageData.url === "string") return imageData.url;
    if (imageData.href && typeof imageData.href === "string") return imageData.href;
    if (imageData.$ && imageData.$.href && typeof imageData.$.href === "string")
      return imageData.$.href;
  }
  return defaultImage;
}

export function HomePageView({
  // 解析 & 搜索
  url,
  onInputChange,
  onParseClick,

  // Saved
  savedPodcasts,
  onSavedPodcastClick,

  // 通用
  errorMsg,
  snackbarOpen,
  onSnackbarClose,

  // 新增：推荐区从 Presenter 传入
  recommendedItems = [],
  isRecLoading = false,
  onSelectPodcast,
}) {
  const navigate = useNavigate();

  function handleRssLinkClick(e, rssUrl) {
    e.preventDefault();
    onInputChange({ target: { value: rssUrl } });
  }

  return (
    <div className="homepage-container">
      <TopNav hideLogo />

      <div className="center-content">
        <div className="logo-container">
          <img src={Logo} alt="Listenary" className="logo" width={200} height={50} />
        </div>

        <div className="search-container" style={{ width: "600px", display: "flex" }}>
          <TextField
            variant="outlined"
            placeholder="Search podcasts by title, author, catergory or RSS link"
            value={url}
            onChange={onInputChange}
            inputProps={{
              autoComplete: "off",
              name: "search_" + Math.random().toString(36).slice(2),
              inputMode: "search",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onParseClick();
            }}
            sx={{
              width: "486px",
              minWidth: "486px",
              maxWidth: "486px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "30px",
                backgroundColor: "#F5F9FF", // 小修正：补上井号，避免无效色值
                paddingLeft: "16px",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E0E0E0" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#C0C0C0" },
              "& .MuiOutlinedInput-input": { paddingLeft: "4px", fontSize: "0.9rem" },
              "& .MuiInputAdornment-root": { marginRight: "8px" },
              "& .MuiOutlinedInput-input::placeholder": { opacity: 1, color: "#757575" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PodcastsIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <button
            type="button"
            className="search-button"
            style={{ width: "90px", minWidth: "90px", maxWidth: "90px", height: "52px", marginLeft: "8px" }}
            onClick={onParseClick}
          >
            Search
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              color: "red",
              marginTop: "0px",
              marginLeft: "8px",
              fontSize: "14px",
              textAlign: "left",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>

      {/* Saved 区域 */}
      <div className="saved-section">
        <div className="saved-header">
          <h2 className="saved-title">
            <FavoriteIcon className="saved-icon" />
            Saved Podcasts
          </h2>
        </div>

        {savedPodcasts && savedPodcasts.length > 0 ? (
          <Box
            sx={{
              maxWidth: 1200,
              mx: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", 
              gap: 2.5,
            }}
          >
            {savedPodcasts.slice(0, 8).map((podcast, index) => (
              <Card
                key={index}
                onClick={() => onSavedPodcastClick(podcast)}
                elevation={2}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform .25s ease, box-shadow .25s ease",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box sx={{ width: "100%", aspectRatio: "1 / 0.5", overflow: "hidden", flexShrink: 0 }}>
                  <CardMedia
                    component="img"
                    image={normalizeImageUrl(podcast.coverImage)}
                    alt={podcast.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                </Box>

                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                    title={podcast.title}
                  >
                    {podcast.title}
                  </Typography>

                  {podcast.author && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={podcast.author}
                    >
                      {podcast.author}
                    </Typography>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.4,
                      minHeight: "4.2em", // 约三行高度，使卡片高度更整齐
                      mt: 0.5,
                    }}
                    title={podcast.description}
                  >
                    {podcast.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          /* 原有空状态保持不变 */
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Podcast.svg?alt=media&token=9ad09cc3-2199-436a-b1d5-4eb1a866b3ea"
              alt="No saved podcasts"
              style={{ width: "160px", marginBottom: "16px" }}
            />
            <Typography variant="body1" color="text.secondary">
              No saved podcasts yet.
            </Typography>
          </Box>
        )}


        {savedPodcasts && savedPodcasts.length > 4 && (
          <a
            href="#"
            className="show-more"
            onClick={function (e) {
              e.preventDefault();
              navigate("/saved-podcasts");
            }}
          >
            Show more
          </a>
        )}

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={onSnackbarClose} message={errorMsg} />
        
        <div
          className="saved-header"
          style={{
            marginTop: "48px",  // 上方间距大
            marginBottom: "-24px", // 下方间距小
          }}
        >
          <h2 className="saved-title">
            <SearchIcon className="saved-icon" />
            Today's Pick
          </h2>
        </div>

      </div>
    </div>
  );
}
