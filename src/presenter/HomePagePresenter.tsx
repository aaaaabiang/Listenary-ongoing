import { HomePageView } from "../views/HomePageView";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import RecommendationRow from "../components/RecommendationRow";
import useInfinitePodcastSearch from "../hooks/useInfinitePodcastSearch";
import React, { useEffect, useState } from "react"; 

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
  const [homeInput, setHomeInput] = useState("");

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
    setHomeInput(event.target.value);
    setErrorMsg("");
  }

    // 新增：一个入口，同时支持 RSS & 关键词
  function handleGoClick() {
    const url = homeInput?.trim();
    if (!url) { setErrorMsg("Please enter the rss link!"); return; }

    if (isValidRssUrl(url)) {
      // RSS 分支：沿用原来的解析流程
      setErrorMsg("");
      props.model.setRssUrl(url); 
      props.model
         .loadRssData()
         .then(() => navigate("/podcast-channel"))
         .catch((error) => { /* 你原来的处理 */ });
      } else {
      // 关键词分支：跳到发现页，带上 ?q=
      navigate(`/search?q=${encodeURIComponent(url)}`);
    }
  }

  // // Handle RSS feed parsing
  // function handleParseClick() {
  //   const url = props.model.rssUrl;

  //   if (!url || url.trim() === "") {
  //     setErrorMsg("Please enter the rss link!");
  //     return;
  //   }

  //   if (!isValidRssUrl(url)) {
  //     setErrorMsg("Please enter a valid RSS link!");
  //     return;
  //   }

  //   setErrorMsg("");
  //   props.model
  //     .loadRssData()
  //     .then(function () {
  //       navigate("/podcast-channel");
  //     })
  //     .catch(function (error) {
  //       navigate("/");
  //       setErrorMsg("Parsing failed, please check the RSS link!");
  //       setSnackbarOpen(true);
  //       console.error("Error in handleParseClick:", error);
  //     });
  // }

    // 为了不改 View，把老的 onParseClick 指到新函数
  const handleParseClick = handleGoClick;


  // Handle saved podcast click - navigate to podcast channel
  function handleSavedPodcastClick(podcast) {
    navigate("/podcast-channel", { state: { rssUrl: podcast.rssUrl } });
  }

  console.log("HomePagePresenter render", props.model.savedPodcasts.length);

  const {
    results: recResults,
    isLoading: recLoading,
    startSearch: doRecSearch,
    setQuery: setRecTerm,
  } = useInfinitePodcastSearch();

  React.useEffect(() => {
    let stop = false;

    async function loadTrending() {
      try {
        const res = await fetch("/api/podcasts/trending?limit=12");
        if (!res.ok) throw new Error("no trending");
        const data = await res.json();
        if (!stop && Array.isArray(data) && data.length) {
          // 直接塞进 Hook 的结果：最简单方式就是覆盖 DOM（这里为简化，直接用 setState 替代）
          // 为避免改 Hook，可另外放一份本地 state：
          setTrending(data);
          return;
        }
      } catch {}

      // fallback：用一个“高热词”搜索一次，当作推荐
      const seed = "technology"; // 可换成你的 recommendedSearchTerms[0]
      setRecTerm(seed);
      doRecSearch(seed);
    }

    loadTrending();
    return () => { stop = true; };
  }, []);

  const [trending, setTrending] = React.useState<any[] | null>(null);
  const recommendItems = trending ?? recResults;

  function handleSelect(p: any) {
    if (p?.url) navigate("/podcast-channel", { state: { rssUrl: p.url } });
  }

  return (
    <>
      <HomePageView
        url={homeInput} 
        onInputChange={inputHandlerACB}
        onParseClick={handleParseClick}
        savedPodcasts={savedPodcasts}
        onSavedPodcastClick={handleSavedPodcastClick}
        errorMsg={errorMsg}
        snackbarOpen={snackbarOpen}
        onSnackbarClose={() => setSnackbarOpen(false)}
      />
            <div style={{ maxWidth: 1200, margin: "16px auto", padding: "0 16px" }}>
        <RecommendationRow
          title="Recommended"
          items={recommendItems.slice(0, 8)}   // 第一行展示 6-8 个
          onSelect={handleSelect}
        />
      </div>
    </>
    
  );
});

export default HomePagePresenter;
