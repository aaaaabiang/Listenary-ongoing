import { observer } from "mobx-react-lite";
import { PodcastChannelView } from "../views/PodcastChannelView";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// 使用 MongoDB API 获取转录列表
import { getUserTranscriptions } from "../api/transcriptionAPI";
import loginModel from "../loginModel"; // Import login model to check user status


// 给 props 一个可用类型（后续再细化到真实 Model）
type Props = { model: any };                                               // [fix]

// Presenter component for podcast channel page
// Handles all business logic and state management
const PodcastChannelPresenter = observer(function PodcastChannelPresenter(
  props: Props                                                              // [fix]
) {
  const navigate = useNavigate();
  const location = useLocation();
  const rssUrl = location.state?.rssUrl || props.model.rssUrl;
  const model = props.model;
  const channelInfo = props.model.podcastChannelInfo;
  const episodes = props.model.podcastEpisodes as any[];                    // [fix]（最小：假定为数组）

  // State management
  const [user, setUser] = useState<any>(null);                               // [fix]
  const [isSaved, setIsSaved] = useState<boolean>(false);                    // [fix]
  const [transcribedGuids, setTranscribedGuids] = useState<string[]>([]);    // [fix]
  const [savedEpisodes, setSavedEpisodes] = useState<any[]>([]);             // [fix]
  const [filterType, setFilterType] = useState<"all" | "transcribed" | "untranscribed">("all"); // [fix]
  const [visibleCount, setVisibleCount] = useState<number>(10);              // [fix]
  const [snackbarState, setSnackbarState] = useState<{                      // [fix]
    open: boolean;
    message: string;
    severity: "success" | "warning" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Initialize user state
  useEffect(function initUser() {
    const currentUser = loginModel.getUser();
    setUser(currentUser);
  }, []);

  // Add auth state listener
  useEffect(function setupAuthListener() {
    const unsubscribe = loginModel.setupAuthStateListener(function(user) {
      setUser(user);
    });
    return function cleanup() {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Load RSS data and transcription data
  useEffect(function loadData() {
    if (rssUrl) {
      model.setRssUrl(rssUrl);
      model.loadRssData();
    }

    loadTranscriptionData();
  }, [rssUrl, user]);

  // Function to load transcription data
  function loadTranscriptionData() {
    if (user) {
      // 从 MongoDB 获取转录列表（无需 uid）
      getUserTranscriptions().then(function handleTranscriptions(transcriptions) {
        const guids = transcriptions.map(function getEpisodeId(t) {
          return t.episodeId.trim();
        });
        setTranscribedGuids(guids);
      }).catch(function(error) {
        console.error("Error loading transcription data:", error);
      });
    }
  }

  // Check if podcast is saved
  useEffect(function checkSavedStatus() {
    if (channelInfo) {
      function isPodcastSaved(podcast) {
        return podcast.title === channelInfo.title;
      }
      const saved = model.savedPodcasts.find(isPodcastSaved);
      setIsSaved(!!saved);
    }
  }, [model.savedPodcasts, channelInfo]);

  // Mark transcribed episodes
  useEffect(function markTranscribedEpisodes() {
    if (episodes.length > 0) {
      function markIfTranscribed(episode) {
        const hasTranscript = transcribedGuids.includes(episode.guid.trim());
        return { ...episode, isTranscribed: hasTranscript };
      }
      const markedEpisodes = episodes.map(markIfTranscribed);
      setSavedEpisodes(markedEpisodes);
    }
  }, [episodes, transcribedGuids]);

  // Handle scroll loading
  useEffect(function handleScrollLoading() {
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        visibleCount < episodes.length
      ) {
        setVisibleCount(function incrementCount(prev) {
          return prev + 5;
        });
      }
    }
    window.addEventListener("scroll", handleScroll);
    return function cleanup() {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [visibleCount, episodes.length]);

  // Show snackbar notification
  function showSnackbar(message: string, severity: "success" | "warning" | "error" | "info" = "success") { // [fix]
    setSnackbarState({
      open: true,
      message: message,
      severity: severity,
    });
  }

  // Handle snackbar close
  function handleSnackbarClose(event, reason) {
    if (reason === "clickaway") return;
    setSnackbarState(function updateState(prev) {
      return { ...prev, open: false };
    });
  }

  // Handle episode play
  function handlePlay(episode) {
    if (!episode) {
      alert("Episode not found");
      return;
    }

    if (episode.enclosure.url) {
      model.setAudioUrl(episode.enclosure.url);
    } else {
      console.error("Episode does not have a valid audio URL:", episode);
    }

    model.setCurrentEpisode(episode);
    model.setAudioUrl(episode.enclosure.url);
    navigate("/podcast-play");
  }

  // Add event listener for transcription completion
  useEffect(function setupTranscriptionListener() {
    function handleTranscriptionComplete(event) {
      loadTranscriptionData();
    }
    
    window.addEventListener("transcriptionComplete", handleTranscriptionComplete);
    
    return function cleanup() {
      window.removeEventListener("transcriptionComplete", handleTranscriptionComplete);
    };
  }, [user]);

  // Handle podcast save
  function savePodcastHandler(podcast) {
    const currentUser = loginModel.getUser();
    if (!currentUser) {
      return { success: false, message: "Please Login First", type: "warning" };
    }
    if (!podcast.rssUrl) {
      podcast.rssUrl = rssUrl;
    }
    model.addToSaved(podcast);
    setIsSaved(true);
    return { success: true, message: "Podcast saved successfully", type: "success" };
  }

  // Handle podcast remove
  function removePodcastHandler(podcast) {
    const currentUser = loginModel.getUser();
    if (!currentUser) {
      return { success: false, message: "Please Login First", type: "warning" };
    }
    model.removeFromSaved(podcast);
    setIsSaved(false);
    return { success: true, message: "Podcast removed from saved list", type: "success" };
  }

  // Handle filter change
  function handleFilterChange(event, newFilter) {
    if (newFilter !== null) {
      setFilterType(newFilter);
    }
  }

  // Filter episodes based on type
  function filterEpisodes(ep) {
    if (filterType === "transcribed") return ep.isTranscribed;
    if (filterType === "untranscribed") return !ep.isTranscribed;
    return true;
  }

  const filteredEpisodes = savedEpisodes.filter(filterEpisodes);

  if (!channelInfo || episodes.length === 0) {
    return (
      <PodcastChannelView
        channelInfo={{}}                 // 不给真实内容
        episodes={Array.from({ length: 8 }, () => ({}))} // 固定数量占位项
        isSaved={false}
        onSavePodcast={() => ({ success: false, message: "", type: "info" })} // 占位回调
        onRemovePodcast={() => ({ success: false, message: "", type: "info" })}
        onPlay={() => {}}
        filterType="all"
        onFilterChange={() => {}}
        snackbarState={{ open: false, message: "", severity: "success" }}
        onSnackbarClose={() => {}}
        loading={true}                   // ← 关键
      />
    );
  }

  return (
    <PodcastChannelView
      channelInfo={channelInfo}
      episodes={filteredEpisodes.slice(0, visibleCount)}
      isSaved={isSaved}
      onSavePodcast={savePodcastHandler}
      onRemovePodcast={removePodcastHandler}
      onPlay={handlePlay}
      filterType={filterType}
      onFilterChange={handleFilterChange}
      snackbarState={snackbarState}
      onSnackbarClose={handleSnackbarClose}
    />
  );
});

export default PodcastChannelPresenter;
