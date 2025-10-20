import { resolvePromise } from "./resolvePromise.js";
import { RssModel } from "./rssModel.js";
import { DictionaryAPI } from "./api/dictionaryAPI";
import { speechToText } from "./api/transcriptionAPI";
// localStorage 相关函数（客户端缓存）
import {
  savePodcastChannelInfo,
  loadPodcastChannelInfo,
  savePodcastEpisodes,
  loadPodcastEpisodes,
  saveRssUrl,
  loadRssUrl,
  saveAudioUrl,
  loadAudioUrl,
} from "./firestoreModel";

// MongoDB API 调用
import { addPodcastToSaved, removePodcastFromSaved } from "./api/userAPI";
import loginModel from "./loginModel";
import { observable, runInAction } from "mobx";

export const model = observable({
  // RSS related states
  rssUrl: loadRssUrl(),
  // Podcast channel information
  podcastChannelInfo: loadPodcastChannelInfo(),
  podcastEpisodes: loadPodcastEpisodes(),
  podcastLoadError: null,
  errorMsg: "", // Error message state

  rssModel: new RssModel(), // RssModel instance
  // Saved podcasts
  savedPodcasts: [],

  //podcast player states
  audioUrl: loadAudioUrl(),
  // Single episode information
  currentEpisode: null,
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
    saveAudioUrl(url);
  },

  setAudioFile(file) {
    this.audioFile = file;
  },

  setAudioDuration(duration) {
    this.audioDuration = duration;
  },

  setRssUrl(url) {
    this.rssUrl = url;
    saveRssUrl(url);
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
        savePodcastChannelInfo(this.podcastChannelInfo);

        this.podcastEpisodes = items;
        savePodcastEpisodes(this.podcastEpisodes);
      });
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
      // console.log("Added to savedPodcasts:", podcastToAdd.title);
      
      // 返回成功结果
      return { success: true, message: "播客已添加到收藏" };
    } catch (error) {
      console.error("Failed to add podcast:", error);
      // 返回错误信息，不直接调用alert
      const errorMessage = error.message || "添加播客失败，请重试";
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
      // console.log("Removed from savedPodcasts:", podcastToRemove.title);
      
      // 返回成功结果
      return { success: true, message: "播客已从收藏中移除" };
    } catch (error) {
      console.error("Failed to remove podcast:", error);
      // 返回错误信息，不直接调用alert
      return { success: false, error: "删除播客失败，请重试" };
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

  // Load recommendations - 从Presenter层移过来的数据获取逻辑
  async loadRecommendations() {
    try {
      const response = await fetch("/api/podcasts/discover?sort=trending&max=8");
      if (!response.ok) {
        throw new Error("Failed to fetch trending podcasts");
      }
      const data = await response.json();
      const processedData = Array.isArray(data) ? data.map(this.sanitizePodcastData) : [];
      return { success: true, data: processedData };
    } catch (error) {
      console.error("Could not load recommendations:", error);
      return { success: false, error: error.message };
    }
  },

  // Data transformation - 从Presenter层移过来的数据转换逻辑
  sanitizePodcastData(podcast) {
    return {
      ...podcast,
      title: this.stripHtml(podcast?.title),
      author: podcast?.author ? this.stripHtml(podcast.author) : "",
      description: this.stripHtml(podcast?.description),
    };
  },

  // HTML stripping utility
  stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  },
});
