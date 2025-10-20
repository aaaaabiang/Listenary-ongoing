import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import {
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
  if (typeof imageData === "string" && imageData.startsWith("http")) {
    return imageData;
  }

  // Case 2: 是一个数组
  if (Array.isArray(imageData) && imageData.length > 0) {
    // 递归处理数组的第一个元素，无论它是字符串还是对象
    return normalizeImageUrl(imageData[0]);
  }

  // Case 3: 是一个对象
  if (typeof imageData === "object" && imageData !== null) {
    // 常见格式: { url: '...' }
    if ((imageData as any).url && typeof (imageData as any).url === "string") {
      return (imageData as any).url;
    }
    // iTunes 常见格式: { href: '...' }
    if ((imageData as any).href && typeof (imageData as any).href === "string") {
      return (imageData as any).href;
    }
    // rss-parser 解析 XML 属性: { $: { href: '...' } }
    if ((imageData as any).$ && (imageData as any).$.href && typeof (imageData as any).$.href === "string") {
      return (imageData as any).$.href;
    }
  }

  // 如果所有尝试都失败，返回默认图片
  return defaultImage;
}

// 辅助函数：去除 HTML 标签并解码常见实体
function stripHtml(input: any): string {
  if (input == null) return "";
  // 有可能是数组或对象，转为字符串即可
  let str = Array.isArray(input) ? String(input[0] ?? "") : String(input);

  // 去掉所有 HTML 标签
  str = str.replace(/<\/?[^>]+>/g, " ");

  // 解码常见实体
  const entityMap: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#39;": "'"
  };
  str = str.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => entityMap[m]);

  // 处理数字实体 &#dddd;
  str = str.replace(/&#(\d+);/g, (_, code) => {
    const n = parseInt(code, 10);
    return Number.isFinite(n) ? String.fromCharCode(n) : "";
  });

  // 折叠多余空白并修剪
  str = str.replace(/\s+/g, " ").trim();

  return str;
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
          <Box
            sx={{
              maxWidth: 1200,
              mx: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2.5
            }}
          >
            {savedPodcasts.map((podcast, index) => {
              const cleanTitle = stripHtml(podcast.title);
              const cleanAuthor = podcast.author ? stripHtml(podcast.author) : "";
              const cleanDesc = stripHtml(podcast.description);

              return (
                <Card
                  key={index}
                  onClick={() => handleViewPodcast(podcast)}
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform .25s ease, box-shadow .25s ease",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%"
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 0.5",
                      overflow: "hidden",
                      flexShrink: 0
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={normalizeImageUrl(podcast.coverImage)}
                      alt={cleanTitle}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block"
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
                        overflow: "hidden"
                      }}
                      title={cleanTitle}
                    >
                      {cleanTitle}
                    </Typography>

                    {cleanAuthor && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                        title={cleanAuthor}
                      >
                        {cleanAuthor}
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
                        minHeight: "4.2em", // 约三行高度，使卡片高度对齐
                        mt: 0.5
                      }}
                      title={cleanDesc}
                    >
                      {cleanDesc}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Box
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 4 }}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
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
