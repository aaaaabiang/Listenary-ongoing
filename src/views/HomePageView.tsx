import "../styles/HomePage.css";
// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import TextField from "@mui/material/TextField";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
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

export function HomePageView({
  // podcast,
  url,
  onInputChange,
  onParseClick,
  savedPodcasts,
  onSavedPodcastClick,
  errorMsg,
  snackbarOpen,
  onSnackbarClose,
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
          <img src={Logo} alt="Listenary" className="logo" width={200} height={50}/>
        </div>

        <div
          className="search-container"
          style={{ width: "600px", display: "flex" }}
        >
          <TextField
            variant="outlined"
            placeholder="Paste RSS link or search podcasts by name"
            value={url}
            onChange={onInputChange}
            autoComplete="off"
            inputProps={{ autoComplete: "off", name: "search_" + Math.random().toString(36).slice(2), inputMode: "search" }}
            onKeyDown={(e) => { if (e.key === "Enter") onParseClick(); }}
            sx={{
              width: "486px",
              minWidth: "486px",
              maxWidth: "486px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "30px",
                backgroundColor: "F5F9FF",
                paddingLeft: "16px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C0C0C0",
              },
              "& .MuiOutlinedInput-input": {
                paddingLeft: "4px",
                fontSize: "0.9rem",
              },
              "& .MuiInputAdornment-root": {
                marginRight: "8px",
              },
              "& .MuiOutlinedInput-input::placeholder": {
                opacity: 1,
                color: "#757575",
              },
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
            style={{
              width: "90px",
              minWidth: "90px",
              maxWidth: "90px",
              height: "52px",
              marginLeft: "8px",
            }}
            onClick={onParseClick}
          >
            Parse
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

        <div className="help-link-wrapper">
          <CollapseBox title="How to use Listenary">
            <ol className="rss-guide-list">
              <li>
                Use <a
                  href="https://castos.com/tools/find-podcast-rss-feed/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Castos RSS Finder 
                </a> to search for a podcast, copy the RSS link, and paste it into
                the Parse box.
              </li>
              <li>Click Parse, then select the episode you want. </li>
              <li>
                Or try this link now! <a href="#"
                  className="example-rss-link"
                  onClick={function(event) {
                    handleRssLinkClick(
                      event,
                      "https://feeds.captivate.fm/one-minute-podcast-tips/"
                    );
                  }}
                >
                  One Minute Podcast Tips.
                </a> Enjoy it!
              </li>
            </ol>
          </CollapseBox>
        </div>
      </div>

      <div className="saved-section">
        <div className="saved-header">
          <h2 className="saved-title">
            <FavoriteIcon className="saved-icon" />
            Saved Podcasts
          </h2>
        </div>

        {savedPodcasts && savedPodcasts.length > 0 ? (
          <Box
            display="flex"
            flexWrap="nowrap"
            gap={1}
            justifyContent="flex-start"
            sx={{
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            {savedPodcasts.slice(0, 4).map((podcast, index) => (
              <Card
                key={index}
                onClick={() => onSavedPodcastClick(podcast)}
                sx={{
                  width: "290px",
                  flexShrink: 0,
                  borderRadius: 3,
                  boxShadow: 1,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={typeof podcast.coverImage === 'string' 
                    ? podcast.coverImage 
                    : "https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Podcast.svg?alt=media&token=9ad09cc3-2199-436a-b1d5-4eb1a866b3ea"}
                  alt={podcast.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {podcast.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.4,
                      minHeight: "2.8em",
                    }}
                  >
                    {podcast.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 4 }}
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={onSnackbarClose}
          message={errorMsg}
        />
      </div>
    </div>
  );
}
