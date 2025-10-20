import { observer } from "mobx-react-lite";
import { PodcastChannelView } from "../views/PodcastChannelView";
import { useState, useEffect, useCallback } from "react";
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

  // ===== 分页参数 =====
  const INITIAL_BATCH = 4;       // 首屏加载 4 个
  const LOAD_MORE_STEP = 5;      // 每次滚动追加 5 个

  // State management
  const [user, setUser] = useState<any>(null);                               // [fix]
  const [isSaved, setIsSaved] = useState<boolean>(false);                    // [fix]
  const [transcribedGuids, setTranscribedGuids] = useState<string[]>([]);    // [fix]
  const [savedEpisodes, setSavedEpisodes] = useState<any[]>([]);             // [fix]
  const [filterType, setFilterType] = useState<"all" | "transcribed" | "untranscribed">("all"); // [fix]
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH);   // ★ 首屏 4 个
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
    } else {
      setSavedEpisodes([]); // 避免旧数据残留
    }
  }, [episodes, transcribedGuids]);

  // Filter episodes based on type
  function filterEpisodes(ep) {
    if (filterType === "transcribed") return ep.isTranscribed;
    if (filterType === "untranscribed") return !ep.isTranscribed;
    return true;
  }

  const filteredEpisodes = savedEpisodes.filter(filterEpisodes);

  // ★ 过滤条件或频道变化时，重置首屏数量为 4
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [filterType, rssUrl]);

  // 是否已经全部加载
  const isDone = filteredEpisodes.length > 0 && visibleCount >= filteredEpisodes.length;

  // 计算 presenter 截断后的列表
  const pagedEpisodes = filteredEpisodes.slice(0, Math.min(visibleCount, filteredEpisodes.length || 0));

  // Handle scroll loading（封顶到总数）
  const handleScroll = useCallback(() => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (!nearBottom) return;
    if (isDone) return;

    setVisibleCount((prev) => {
      const next = prev + LOAD_MORE_STEP;
      const total = filteredEpisodes.length;
      return next >= total ? total : next;
    });
  }, [filteredEpisodes.length, isDone]);

  useEffect(function handleScrollLoading() {
    window.addEventListener("scroll", handleScroll);
    return function cleanup() {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

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
  async function savePodcastHandler(podcast) {
    const currentUser = loginModel.getUser();
    if (!currentUser) {
      return { success: false, message: "Please Login First", type: "warning" };
    }
    if (!podcast.rssUrl) {
      podcast.rssUrl = rssUrl;
    }
    
    try {
      const result = await model.addToSaved(podcast);
      if (result.success) {
        setIsSaved(true);
        return { success: true, message: result.message, type: "success" };
      } else {
        return { success: false, message: result.error, type: "error" };
      }
    } catch (error) {
      return { success: false, message: "保存播客时发生错误", type: "error" };
    }
  }

  // Handle podcast remove
  async function removePodcastHandler(podcast) {
    const currentUser = loginModel.getUser();
    if (!currentUser) {
      return { success: false, message: "Please Login First", type: "warning" };
    }
    
    try {
      const result = await model.removeFromSaved(podcast);
      if (result.success) {
        setIsSaved(false);
        return { success: true, message: result.message, type: "success" };
      } else {
        return { success: false, message: result.error, type: "error" };
      }
    } catch (error) {
      return { success: false, message: "删除播客时发生错误", type: "error" };
    }
  }

  // Handle filter change
  function handleFilterChange(event, newFilter) {
    if (newFilter !== null) {
      setFilterType(newFilter);
    }
  }

  if (!channelInfo || episodes.length === 0) {
    return (
      <PodcastChannelView
        channelInfo={{}}               
        episodes={Array.from({ length: 8 }, () => ({}))} // 固定数量占位项
        isSaved={false}
        onSavePodcast={() => ({ success: false, message: "", type: "info" })} // 占位回调
        onRemovePodcast={() => ({ success: false, message: "", type: "info" })}
        onPlay={() => {}}
        filterType="all"
        onFilterChange={() => {}}
        snackbarState={{ open: false, message: "", severity: "success" }}
        onSnackbarClose={() => {}}
        loading={true}                
      />
    );
  }

  return (
    <>
      <PodcastChannelView
        channelInfo={channelInfo}
        episodes={pagedEpisodes}        
        isSaved={isSaved}
        onSavePodcast={savePodcastHandler}
        onRemovePodcast={removePodcastHandler}
        onPlay={handlePlay}
        filterType={filterType}
        onFilterChange={handleFilterChange}
        snackbarState={snackbarState}
        onSnackbarClose={handleSnackbarClose}
      />
      <div style={{ textAlign: "center", padding: "18px 0", opacity: 0.7 }}>
        {isDone ? "- The end of the list -" : null}
      </div>
    </>
  );
});

export default PodcastChannelPresenter;
