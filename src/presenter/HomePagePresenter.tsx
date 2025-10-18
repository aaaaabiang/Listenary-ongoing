// src/presenter/HomePagePresenter.tsx (修正后的完整代码)

import { HomePageView } from "../views/HomePageView";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import RecommendationRow from "../components/RecommendationRow";
import React, { useEffect, useState } from "react";
import { apiRequest } from "../config/apiConfig"; 

type Props = { model: any };

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
  useEffect(() => {
    let isMounted = true; // 防止组件卸载后继续更新状态

    async function loadRecommendations() {
      setIsRecLoading(true);
      try {
        // 1. 请求正确的后端 API 地址，并限制数量
        const response = await apiRequest('/api/podcasts/discover?sort=trending&max=8');
        if (!response.ok) {
          throw new Error('Failed to fetch trending podcasts');
        }
        const data = await response.json();
        if (isMounted) {
          setRecommendedItems(data);
        }
      } catch (error) {
        console.error("Could not load recommendations:", error);
        if (isMounted) {
          setRecommendedItems([]); // 失败时设置为空数组
        }
      } finally {
        if (isMounted) {
          setIsRecLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      isMounted = false; // 组件卸载时设置标志
    };
  }, []); // 空依赖数组，确保只在组件首次加载时运行一次


  // --- 输入框和导航逻辑 (保持不变) ---
  function isValidRssUrl(url: string) {
    try {
      new URL(url);
    } catch (e) {
      return false;
    }
    const rssPatterns = [/\.xml$/i, /\/feed/i, /\/rss/i, /\/podcast/i, /\/itunes/i, /\/feedburner/i];
    return rssPatterns.some(pattern => pattern.test(url));
  }

  function inputHandlerACB(event: React.ChangeEvent<HTMLInputElement>) {
    setHomeInput(event.target.value);
    setErrorMsg("");
  }

  function handleGoClick() {
    const url = homeInput?.trim();
    if (!url) { 
      setErrorMsg("Please enter an RSS link or a search term!"); 
      return; 
    }

    if (isValidRssUrl(url)) {
      // 是 RSS 链接 -> 跳转到频道页
      setErrorMsg("");
      props.model.setRssUrl(url); 
      props.model.loadRssData()
         .then(() => navigate("/podcast-channel"))
         .catch((error: any) => {
            setErrorMsg("Parsing failed, please check the RSS link!");
            setSnackbarOpen(true);
         });
    } else {
      // 不是 RSS 链接 -> 作为关键词跳转到搜索页
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

  return (
    <>
      <HomePageView
        url={homeInput} 
        onInputChange={inputHandlerACB}
        onParseClick={handleGoClick} // 使用统一的处理函数
        savedPodcasts={savedPodcasts}
        onSavedPodcastClick={handleSavedPodcastClick}
        errorMsg={errorMsg}
        snackbarOpen={snackbarOpen}
        onSnackbarClose={() => setSnackbarOpen(false)}
      />
      <div style={{ maxWidth: 1200, margin: "16px auto", padding: "0 16px" }}>
        <RecommendationRow
          title="Recommended For You"
          items={recommendedItems} // 直接使用新的 state
          onSelect={handleSelectRecommendation}
          isLoading={isRecLoading} // 传递加载状态
        />
      </div>
    </>
  );
});

export default HomePagePresenter;