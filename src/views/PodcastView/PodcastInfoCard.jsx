import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Tooltip,
} from "@mui/material";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";

export function PodcastInfoCard({ podcastData, isTranscribing, onTranscribe }) {
  return (
    <Box
      className="left-panel"
      sx={{
        flexShrink: 0,
        width: { xs: "100%", md: 400 },
        height: "95%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Card
        elevation={1}
        sx={{
          width: "100%",
          borderRadius: 6,
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
            px: 3,
            py: 1.5
          }}
        >
          <Tooltip title={podcastData.source || "Name of Podcast"} arrow>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              fontSize={20}
              lineHeight={1.3}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                cursor: "default"
              }}
            >
              {podcastData.source || "Name of Podcast"}
            </Typography>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }}></Box>
        </CardContent>

        <CardMedia
          component="img"
          sx={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            maxHeight: { xs: 120, sm: 140, md: 160, lg: 220 },
            flexShrink: 1,
          }}
          image={podcastData.coverImage}
          alt="Podcast Cover"
        />

        <CardContent 
          sx={{ 
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",  // 保证内容和按钮分开
            flexGrow: 1,
            minHeight: 0, // 避免无限撑高
            overflow: "hidden",
            p: 2
          }}
        >
          <Tooltip title={podcastData.title || "Episode Name"} arrow>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              fontSize={22}
              gutterBottom
              noWrap
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "default",
                flexShrink: 0,
                maxWidth: "100%",
              }}
            >
              {podcastData.title || "Episode Name"}
            </Typography>
          </Tooltip>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={1}
            className="typography-scrollable"
            sx={{
              lineHeight: 1.5,
              overflowY: "auto",
              pr: 1,
              flex: "1 1 auto",
              maxHeight: "none"
            }}
          >
            {podcastData.description || "Description..."}
          </Typography>
          <Box mt={2}>
            <Tooltip title="Only English podcasts are supported for now" arrow>
              <Button
                variant="contained"
                startIcon={<GraphicEqIcon />}
                size="small"
                onClick={onTranscribe}
                disabled={isTranscribing}
                sx={{
                  borderRadius: "100px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  py: 0.5,
                  backgroundColor: "#006BFE",
                  color: "#fff",
                  boxShadow: 1,
                  width: "100%", // 宽度适配小屏
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    boxShadow: 4
                  },
                  "&:disabled": {
                    backgroundColor: "grey.400",
                    color: "white"
                  }
                }}
              >
                {isTranscribing ? "Transcribing..." : "Transcribe"}
              </Button>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
