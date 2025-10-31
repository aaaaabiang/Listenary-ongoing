import { RssModel } from "./rssModel.js";
import { loadCacheSnapshot } from "./service/podcastCacheService";

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

  beginRssLoad() {
    runInAction(() => {
      this.podcastLoadError = null;
      this.podcastChannelInfo = null;
      this.podcastEpisodes = [];
      this.rssModel.clear();
    });
  },

  applyRssData(feed, items) {
    this.rssModel.setData(feed, items);
    runInAction(() => {
      if (feed) {
        this.podcastChannelInfo = {
          title: feed.title,
          description: feed.description,
          coverImage: feed.image,
          rssUrl: this.rssUrl,
        };
      } else {
        this.podcastChannelInfo = null;
      }

      this.podcastEpisodes = Array.isArray(items) ? items : [];
    });
  },

  setRssLoadError(message) {
    runInAction(() => {
      this.podcastLoadError = message;
    });
  },

  clearTranscriptionPromise() {
    runInAction(() => {
      this.transcripResultsPromiseState.data = null;
      this.transcripResultsPromiseState.error = null;
    });
  },

  setTranscriptionPromiseData(data) {
    runInAction(() => {
      this.transcripResultsPromiseState.data = data;
      this.transcripResultsPromiseState.error = null;
    });
  },

  setTranscriptionPromiseError(error) {
    runInAction(() => {
      this.transcripResultsPromiseState.error = error;
    });
  },

  resetTranscriptionState() {
    this.setResults([]);
    this.clearTranscriptionPromise();
  },

  replaceSavedPodcasts(podcasts) {
    runInAction(() => {
      this.savedPodcasts.splice(0, this.savedPodcasts.length, ...(podcasts || []));
    });
  },

  setDictionaryResult(result) {
    this.dictionaryResult = result;
  },

  clearDictionaryResult() {
    this.dictionaryResult = null;
  },

  // Set error message
  setErrorMsg(message) {
    this.errorMsg = message;
  },

});
