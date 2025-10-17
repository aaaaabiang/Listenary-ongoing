import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import {
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography
} from "@mui/material";

// 辅助函数：标准化图片URL
function normalizeImageUrl(imageData: any): string {
  const defaultImage = "https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Podcast.svg?alt=media&token=9ad09cc3-2199-436a-b1d5-4eb1a866b3ea";
  
  if (!imageData) return defaultImage;
  
  // Case 1: 本身就是 URL 字符串
  if (typeof imageData === 'string' && imageData.startsWith('http')) {
    return imageData;
  }
  
  // Case 2: 是一个数组
  if (Array.isArray(imageData) && imageData.length > 0) {
    // 递归处理数组的第一个元素，无论它是字符串还是对象
    return normalizeImageUrl(imageData[0]);
  }
  
  // Case 3: 是一个对象
  if (typeof imageData === 'object' && imageData !== null) {
    // 常见格式: { url: '...' }
    if (imageData.url && typeof imageData.url === 'string') {
      return imageData.url;
    }
    // iTunes 常见格式: { href: '...' }
    if (imageData.href && typeof imageData.href === 'string') {
      return imageData.href;
    }
    // 处理 rss-parser 解析 XML 属性时的格式: { $: { href: '...' } }
    if (imageData.$ && imageData.$.href && typeof imageData.$.href === 'string') {
      return imageData.$.href;
    }
  }
  
  // 如果所有尝试都失败，返回默认图片
  return defaultImage;
}

/**
 * View component for displaying saved podcasts
 * @param {Object} props - Component props
 * @param {Array} props.savedPodcasts - Array of saved podcast objects
 */
function SavedPodcastsView(props) {
  const savedPodcasts = props.savedPodcasts;
  const navigate = useNavigate();

  function handleViewPodcast(podcast) {
    navigate("/podcast-channel", { state: { rssUrl: podcast.rssUrl } });
  }

  return (
    <div className="homepage-container">
      <TopNav />
<div className="saved-section">
  <div className="saved-header">
    <h2 className="saved-title">
      <img src="/saved-icon.png" alt="" className="saved-icon" />
      All Saved Podcasts
    </h2>
  </div>

  {savedPodcasts && savedPodcasts.length > 0 ? (
    <div className="saved-grid">
      {savedPodcasts.map(function (podcast, index) {
        return (
          <div
            key={index}
            className="saved-item"
            onClick={function () {
              handleViewPodcast(podcast);
            }}
          >
            <div className="saved-item-image-wrapper">
              <img
                src={normalizeImageUrl(podcast.coverImage)}
                alt={podcast.title}
                className="saved-item-image"
              />
            </div>
            <h3 className="saved-item-title">{podcast.title}</h3>
            <p className="saved-item-description">{podcast.description}</p>
          </div>
        );
      })}
      </div>
      ) : (
        <Box
          width="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 4 }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <img
              src="https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Podcast.svg?alt=media&token=9ad09cc3-2199-436a-b1d5-4eb1a866b3ea"
              alt="No saved podcasts"
              style={{ width: "160px", marginBottom: "16px" }}
            />
            <Typography variant="body1" color="text.secondary">
              No saved podcasts yet.
            </Typography>
          </Box>
        </Box>
      )}
    </div>
  </div>
  );
}

export { SavedPodcastsView }; 