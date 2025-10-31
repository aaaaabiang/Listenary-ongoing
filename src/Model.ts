import { resolvePromise } from "./resolvePromise.js";
import { RssModel } from "./rssModel.js";
import { DictionaryAPI } from "./api/dictionaryAPI";
import { speechToText } from "./api/transcriptionAPI";
import { apiRequest } from "./config/apiConfig";
import { stripHtml } from "./utils/stripHtml";
import { loadCacheSnapshot } from "./podcastCacheService";

// MongoDB API 调用
import { addPodcastToSaved, removePodcastFromSaved } from "./api/userAPI";
// loginModel已删除，使用useAuthContext替代
import { observable, runInAction } from "mobx";

const initialCache = loadCacheSnapshot();

export const model = observable({
  // RSS related states
  rssUrl: initialCache.rssUrl,
  // Podcast channel information
  podcastChannelInfo: initialCache.podcastChannelInfo,
  podcastEpisodes: initialCache.podcastEpisodes,
  podcastLoadError: null,
  errorMsg: "", // Error message state

  rssModel: new RssModel(), // RssModel instance
  // Saved podcasts
  savedPodcasts: [],

  //podcast player states
  audioUrl: initialCache.audioUrl,
  // Single episode information
  currentEpisode: initialCache.currentEpisode,
  audioFile: null, // Store audio file
  transcripResults: [],
  transcripResultsPromiseState: { data: null, error: null },

  // Dictionary lookup state
  dictionaryResult: null,
  dictionaryLookupPromiseState: {},

  setResults(results) {
    this.transcripResults.replace(results);
  },

  setAudioUrl(url) {
    this.audioUrl = url;
  },

  setAudioFile(file) {
    this.audioFile = file;
  },

  setAudioDuration(duration) {
    this.audioDuration = duration;
  },

  setRssUrl(url) {
    this.rssUrl = url;
  },

  setCurrentEpisode(episode) {
    this.currentEpisode = episode;
  },

  async loadRssData() {
    runInAction(() => {
      this.podcastLoadError = null;
      this.podcastChannelInfo = null;
      this.podcastEpisodes = [];
    });

    try {
      const { feed, items } = await this.rssModel.loadFeed(this.rssUrl);
      runInAction(() => {
        this.podcastChannelInfo = {
          title: feed.title,
          description: feed.description,
          coverImage: feed.image,
          rssUrl: this.rssUrl,
        };

        this.podcastEpisodes = items;
      });

      return {
        feed: this.podcastChannelInfo,
        episodes: this.podcastEpisodes,
      };
    } catch (err) {
      console.error("RSS fetch failed", err);
      runInAction(() => {
        this.podcastLoadError = err.message;
      });
      throw err;
    }
  },

  // Store ASR API result in transcription result promise state
  getTranscription(params) {
    resolvePromise(
      speechToText({
        audioUrl: params.audioUrl,
        episodeId: params.episodeId,
        rssUrl: params.rssUrl,
        duration: params.duration,
      }),
      this.transcripResultsPromiseState
    );
  },

  // Save selected podcast
  async addToSaved(podcastToAdd) {
    if (!podcastToAdd.rssUrl) {
      podcastToAdd.rssUrl = this.rssUrl;
    }

    try {
      // 调用 MongoDB API 添加播客，后端会处理重复检查
      const updatedPodcasts = await addPodcastToSaved({
        title: podcastToAdd.title,
        rssUrl: podcastToAdd.rssUrl,
        coverImage: podcastToAdd.coverImage,
        description: podcastToAdd.description,
      });

      runInAction(() => {
        this.savedPodcasts.splice(
          0,
          this.savedPodcasts.length,
          ...updatedPodcasts
        );
      });

      // 返回成功结果
      return { success: true, message: "Podcast added to favorites" };
    } catch (error) {
      console.error("Failed to add podcast:", error);
      // 返回错误信息，不直接调用alert
      const errorMessage = error.message || "Failed to add podcast, please try again";
      return { success: false, error: errorMessage };
    }
  },

  // Unsave selected podcast
  async removeFromSaved(podcastToRemove) {
    try {
      // 调用 MongoDB API 删除播客
      const updatedPodcasts = await removePodcastFromSaved(
        podcastToRemove.title
      );

      runInAction(() => {
        this.savedPodcasts.splice(
          0,
          this.savedPodcasts.length,
          ...updatedPodcasts
        );
      });

      // 返回成功结果
      return { success: true, message: "Podcast removed from favorites" };
    } catch (error) {
      console.error("Failed to remove podcast:", error);
      // 返回错误信息，不直接调用alert
      return { success: false, error: "Failed to delete podcast, please try again" };
    }
  },

  // Dictionary lookup method
  async lookupWord(word) {
    try {
      // 使用统一的字典API
      const result = await DictionaryAPI.getWord(word);
      this.dictionaryResult = result;
      return result;
    } catch (error) {
      console.error("Dictionary lookup failed:", error);
      this.dictionaryResult = null;
      return null;
    }
  },

  // Set error message
  setErrorMsg(message) {
    this.errorMsg = message;
  },

  // Data transformation methods - 从View层移过来的数据转换逻辑
  normalizeImageUrl(imageData) {
    const defaultImage =
      "https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Podcast.svg?alt=media&token=9ad09cc3-2199-436a-b1d5-4eb1a866b3ea";

    if (!imageData) return defaultImage;

    if (typeof imageData === "string" && imageData.startsWith("http")) {
      return imageData;
    }
    if (Array.isArray(imageData) && imageData.length > 0) {
      return this.normalizeImageUrl(imageData[0]);
    }
    if (typeof imageData === "object" && imageData !== null) {
      if (imageData.url && typeof imageData.url === "string")
        return imageData.url;
      if (imageData.href && typeof imageData.href === "string")
        return imageData.href;
      if (
        imageData.$ &&
        imageData.$.href &&
        typeof imageData.$.href === "string"
      )
        return imageData.$.href;
    }
    return defaultImage;
  },

  stripHtml,

  // API methods - 从Presenter层移过来的数据获取逻辑
  async loadRecommendations() {
    try {
      const response = await apiRequest(
        "/api/podcasts/discover?sort=trending&max=8"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch trending podcasts");
      }
      const data = await response.json();
      const processedData = Array.isArray(data)
        ? data.map((podcast) => this.sanitizePodcast(podcast))
        : [];
      return { success: true, data: processedData };
    } catch (error) {
      console.error("Could not load recommendations:", error);
      return { success: false, error: error.message };
    }
  },

  async loadDiscoverData(category, sort, lang = "en") {
    try {
      const params = new URLSearchParams({ lang, sort });
      if (category && category !== "all") params.append("category", category);

      const response = await apiRequest(
        `/api/podcasts/discover?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(
          "Failed to fetch discovery data. Please try again later."
        );
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch discover data:", error);
      return { success: false, error: error.message };
    }
  },

  async searchPodcasts(term) {
    try {
      const response = await apiRequest(
        `/api/podcasts/search?q=${encodeURIComponent(term)}`
      );
      if (!response.ok) {
        throw new Error(
          "Failed to fetch search results. Please try again later."
        );
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Failed to search podcasts:", error);
      return { success: false, error: error.message };
    }
  },

  async loadCategories() {
    try {
      const response = await apiRequest("/api/podcasts/categories");
      if (!response.ok) {
        throw new Error("Failed to load categories");
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Failed to load categories:", error);
      return { success: false, error: error.message };
    }
  },

  // 数据清洗方法
  sanitizePodcast(podcast) {
    return {
      ...podcast,
      title: this.stripHtml(podcast?.title),
      author: podcast?.author ? this.stripHtml(podcast.author) : "",
      description: this.stripHtml(podcast?.description),
      coverImage: this.normalizeImageUrl(podcast?.coverImage),
    };
  },
});
