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

// 数据转换函数已移到Model层

/**
 * View component for displaying saved podcasts
 * @param {Object} props - Component props
 * @param {Array} props.savedPodcasts - Array of saved podcast objects
 */
function SavedPodcastsView(props) {
  const savedPodcasts = props.savedPodcasts;
  const navigate = useNavigate();

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
              const cleanTitle = podcast.title;
              const cleanAuthor = podcast.author || "";
              const cleanDesc = podcast.description;

              return (
                <Card
                  key={index}
                  onClick={() => props.onViewPodcast(podcast)}
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
                      image={podcast.coverImage}
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
