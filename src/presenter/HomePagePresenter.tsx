
import { observer } from "mobx-react-lite";
import { HomePageView } from "../views/HomePageView";
import { useNavigate } from "react-router-dom";
import RecommendationRow from "../components/RecommendationRow";
import React, { useEffect, useRef, useState } from "react";
import { apiRequest } from "../config/apiConfig";
import { setPrefetch } from "../utils/prefetchCache";
import { stripHtml } from "../utils/stripHtml";
import { podcastCacheService } from "../podcastCacheService";

type Props = { model: any };

// 数据转换已移到Model层

const HomePagePresenter = observer(function HomePagePresenter(props: Props) {
  const navigate = useNavigate();
  const savedPodcasts = props.model.savedPodcasts;
  const [errorMsg, setErrorMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [homeInput, setHomeInput] = useState("");

  // --- 新增：用于存储推荐播客的状态 ---
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(true);

  // --- 修正：使用一个独立的、简化的 useEffect 来获取推荐数据 ---
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true; // 防止组件卸载后继续更新状态

    async function loadRecommendations() {
      setIsRecLoading(true);
      try {
        // 通过Model层获取推荐数据
        const result = await props.model.loadRecommendations();
        if (isMountedRef.current) {
          if (result.success) {
            setRecommendedItems(result.data);
          } else {
            setErrorMsg(result.error);
            setRecommendedItems([]);
          }
        }
      } catch (error) {
        console.error("Could not load recommendations:", error);
        if (isMountedRef.current) {
          setErrorMsg("Failed to load recommendations");
          setRecommendedItems([]);
        }
      } finally {
        if (isMountedRef.current) {
          setIsRecLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      isMountedRef.current = false; // 组件卸载时设置标志
    };
  }, []); // 空依赖数组，确保只在组件首次加载时运行一次

  // --- 输入框和导航逻辑 ---
  function inputHandlerACB(event: React.ChangeEvent<HTMLInputElement>) {
    setHomeInput(event.target.value);
    setErrorMsg("");
  }

  function handleGoClick() {
    const url = homeInput?.trim();
    if (!url) {
      setErrorMsg("Please enter a search term or a RSS link");
      return;
    }

    // 简单的URL格式检查，具体RSS验证交给后端
    try {
      new URL(url);
      // 看起来像URL -> 尝试作为RSS链接处理
      setErrorMsg("");
      props.model.setRssUrl(url);
      podcastCacheService.saveRssUrl(url);
      props.model
        .loadRssData()
        .then((result: any) => {
          if (result?.feed) {
            podcastCacheService.savePodcastChannelInfo(result.feed);
          }
          if (Array.isArray(result?.episodes)) {
            podcastCacheService.savePodcastEpisodes(result.episodes);
          }
          navigate("/podcast-channel");
        })
        .catch((error: any) => {
          // 如果RSS解析失败，作为搜索词处理
          console.error("RSS parsing failed, treating as search term:", error);
          navigate(`/search?q=${encodeURIComponent(url)}`);
        });
    } catch (e) {
      // 不是有效URL -> 作为关键词跳转到搜索页
      navigate(`/search?q=${encodeURIComponent(url)}`);
    }
  }

  function handleSavedPodcastClick(podcast: any) {
    navigate("/podcast-channel", { state: { rssUrl: podcast.rssUrl } });
  }

  function handleSelectRecommendation(podcast: any) {
    if (podcast?.url) {
      navigate("/podcast-channel", { state: { rssUrl: podcast.url } });
    }
  }

  const handleSelectPodcast = (podcast: { url?: string }) => {
    if (podcast?.url) {
      navigate("/podcast-channel", { state: { rssUrl: podcast.url } });
    } else {
      console.warn("Selected podcast is missing url (rssUrl).", podcast);
    }
  };

  // RSS链接点击处理 - 从View层移过来的业务逻辑
  const handleRssLinkClick = (rssUrl: string) => {
    setHomeInput(rssUrl);
    setErrorMsg("");
  };

  // 数据转换已移到Model层，这里直接使用原始数据
  const savedPodcastsVM = Array.isArray(savedPodcasts) ? savedPodcasts : [];

  return (
    <>
      <HomePageView
        url={homeInput}
        onInputChange={inputHandlerACB}
        onParseClick={handleGoClick} // 使用统一的处理函数
        savedPodcasts={savedPodcastsVM} 
        onSavedPodcastClick={handleSavedPodcastClick}
        errorMsg={errorMsg}
        snackbarOpen={snackbarOpen}
        onSnackbarClose={() => setSnackbarOpen(false)}
        recommendedItems={recommendedItems}  
        isRecLoading={isRecLoading}
        onSelectPodcast={handleSelectPodcast}
        onRssLinkClick={handleRssLinkClick}
      />
      <div style={{ maxWidth: 1200, margin: "16px auto", padding: "0 0px" }}>
        <RecommendationRow
          items={recommendedItems}            
          onSelect={handleSelectRecommendation}
          isLoading={isRecLoading}               // 传递加载状态
        />
      </div>
    </>
  );
});

export default HomePagePresenter;
