import { resolvePromise } from "./resolvePromise.js";
import { speechToText } from "./speechToText.js";
import { PARSE_RSS_FEED_URL } from "../listenary-backend/config/apiConfig.js";
import { RssModel } from "./rssModel.js";
import { DictionaryAPI } from "./api/dictionaryAPI";
import {
  saveUserData,
  savePodcastChannelInfo,
  loadPodcastChannelInfo,
  savePodcastEpisodes,
  loadPodcastEpisodes,
  saveRssUrl,
  loadRssUrl,
  saveAudioUrl,
  loadAudioUrl,
} from "./firestoreModel";
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
      }),
      this.transcripResultsPromiseState
    );
  },

  // Save selected podcast
  addToSaved(podcastToAdd) {
    function isPodcastAlreadySaved(savedPodcast) {
      return savedPodcast.title === podcastToAdd.title;
    }

    if (!this.savedPodcasts.find(isPodcastAlreadySaved)) {
      if (!podcastToAdd.rssUrl) {
        podcastToAdd.rssUrl = this.rssUrl;
      }

      runInAction(() => {
        this.savedPodcasts.push(podcastToAdd);
      });
      console.log("Added to savedPodcasts: " + podcastToAdd.title);
      this.persistUserData();
    }
  },

  // Unsave selected podcast
  removeFromSaved(podcastToRemove) {
    function shouldWeKeepPodcastCB(podcast) {
      return podcast.title !== podcastToRemove.title;
    }
    runInAction(() => {
      this.savedPodcasts = this.savedPodcasts.filter(shouldWeKeepPodcastCB);
    });
    console.log("Removed from savedPodcasts: " + podcastToRemove.title);
    this.persistUserData();
  },

  /**
   * Persist user data to Firestore (username, savedPodcasts)
   */
  persistUserData() {
    const user = loginModel.getUser();
    if (user) {
      saveUserData(user.uid, {
        username: user.displayName,
        savedPodcasts: this.savedPodcasts.slice(),
      });
    }
  },

  // Dictionary lookup method
async lookupWord(word) {
  try {
    // 直接调用我们的后端API端点
    const response = await fetch(`/api/dictionary/${word}`);
    if (!response.ok) {
      // 如果后端返回404或其他错误，我们在这里处理
      console.warn(`No dictionary data found for word: ${word}`);
      return null;
    }
    const result = await response.json();
    this.dictionaryResult = result;
    return result;
  } catch (error) {
    console.error("Dictionary lookup via backend failed:", error);
    this.dictionaryResult = null;
    return null;
  }
},

  // Set error message
  setErrorMsg(message) {
    this.errorMsg = message;
  },
});
