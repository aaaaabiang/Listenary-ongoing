import { HomePageView } from "../views/HomePageView";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// HomePagePresenter: Handles all business logic for the home page
// - Manages navigation
// - Handles RSS URL input and parsing
// - Manages saved podcasts display

type Props = { model: any }; // [fix]


const HomePagePresenter = observer(function HomePagePresenter(props: Props) {
  const navigate = useNavigate();
  const savedPodcasts = props.model.savedPodcasts;
  const [errorMsg, setErrorMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Verify RSS link format
  function isValidRssUrl(url) {
    try {
      new URL(url);
    } catch (e) {
      return false;
    }

    // verification of RSS links
    const rssPatterns = [
      /\.xml$/i, // .xml end
      /\/feed/i, // include /feed
      /\/rss/i, // include /rss
      /\/podcast/i, // include /podcast
      /\/itunes/i, // include /itunes
      /\/feedburner/i, // include /feedburner
    ];

    return rssPatterns.some(function (pattern) {
      return pattern.test(url);
    });
  }

  // Handle RSS URL input changes
  function inputHandlerACB(event) {
    props.model.setRssUrl(event.target.value);
    setErrorMsg("");
  }

  // Handle RSS feed parsing
  function handleParseClick() {
    const url = props.model.rssUrl;

    if (!url || url.trim() === "") {
      setErrorMsg("Please enter the rss link!");
      return;
    }

    if (!isValidRssUrl(url)) {
      setErrorMsg("Please enter a valid RSS link!");
      return;
    }

    setErrorMsg("");
    props.model
      .loadRssData()
      .then(function () {
        navigate("/podcast-channel");
      })
      .catch(function (error) {
        navigate("/");
        setErrorMsg("Parsing failed, please check the RSS link!");
        setSnackbarOpen(true);
        console.error("Error in handleParseClick:", error);
      });
  }

  // Handle saved podcast click - navigate to podcast channel
  function handleSavedPodcastClick(podcast) {
    navigate("/podcast-channel", { state: { rssUrl: podcast.rssUrl } });
  }

  console.log("HomePagePresenter render", props.model.savedPodcasts.length);

  return (
    <HomePageView
      url={props.model.rssUrl}
      onInputChange={inputHandlerACB}
      onParseClick={handleParseClick}
      savedPodcasts={savedPodcasts}
      onSavedPodcastClick={handleSavedPodcastClick}
      errorMsg={errorMsg}
      snackbarOpen={snackbarOpen}
      onSnackbarClose={() => setSnackbarOpen(false)}
    />
  );
});

export { HomePagePresenter };
