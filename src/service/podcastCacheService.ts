const PODCAST_CHANNEL_INFO_KEY = "podcastChannelInfo";
const PODCAST_EPISODES_KEY = "podcastEpisodes";
const RSS_URL_KEY = "rssUrl";
const AUDIO_URL_KEY = "audioUrl";
const CURRENT_EPISODE_KEY = "currentEpisode";
const PREFETCH_KEY = "listenary.prefetch.v1";

type JsonValue = any;

function readJson<T extends JsonValue>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`[podcastCacheService] Failed to read key "${key}"`, error);
    return fallback;
  }
}

function writeJson(key: string, value: JsonValue) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[podcastCacheService] Failed to write key "${key}"`, error);
  }
}

function readString(key: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch (error) {
    console.warn(`[podcastCacheService] Failed to read key "${key}"`, error);
    return fallback;
  }
}

function writeString(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[podcastCacheService] Failed to write key "${key}"`, error);
  }
}

export type PodcastCacheSnapshot = {
  rssUrl: string;
  podcastChannelInfo: JsonValue | null;
  podcastEpisodes: JsonValue[];
  audioUrl: string;
  currentEpisode: JsonValue | null;
};

type PrefetchEntry = {
  ts: number;
  data: any[];
};

type PrefetchCache = Record<string, PrefetchEntry | undefined>;

export function loadCacheSnapshot(): PodcastCacheSnapshot {
  return {
    rssUrl: loadRssUrl(),
    podcastChannelInfo: loadPodcastChannelInfo(),
    podcastEpisodes: loadPodcastEpisodes(),
    audioUrl: loadAudioUrl(),
    currentEpisode: loadCurrentEpisode(),
  };
}

export function savePodcastChannelInfo(channelInfo: JsonValue) {
  writeJson(PODCAST_CHANNEL_INFO_KEY, channelInfo);
}

export function loadPodcastChannelInfo() {
  return readJson<JsonValue | null>(PODCAST_CHANNEL_INFO_KEY, null);
}

export function savePodcastEpisodes(episodes: JsonValue[]) {
  writeJson(PODCAST_EPISODES_KEY, episodes);
}

export function loadPodcastEpisodes() {
  return readJson<JsonValue[]>(PODCAST_EPISODES_KEY, []);
}

export function saveRssUrl(url: string) {
  writeString(RSS_URL_KEY, url);
}

export function loadRssUrl() {
  return readString(RSS_URL_KEY, "");
}

export function saveAudioUrl(url: string) {
  writeString(AUDIO_URL_KEY, url);
}

export function loadAudioUrl() {
  return readString(AUDIO_URL_KEY, "");
}

export function saveCurrentEpisode(episode: JsonValue) {
  writeJson(CURRENT_EPISODE_KEY, episode);
}

export function loadCurrentEpisode() {
  return readJson<JsonValue | null>(CURRENT_EPISODE_KEY, null);
}

export function loadPrefetchCache(): PrefetchCache {
  return readJson<PrefetchCache>(PREFETCH_KEY, {});
}

export function savePrefetchCache(cache: PrefetchCache) {
  writeJson(PREFETCH_KEY, cache);
}

export const podcastCacheService = {
  loadCacheSnapshot,
  savePodcastChannelInfo,
  loadPodcastChannelInfo,
  savePodcastEpisodes,
  loadPodcastEpisodes,
  saveRssUrl,
  loadRssUrl,
  saveAudioUrl,
  loadAudioUrl,
  saveCurrentEpisode,
  loadCurrentEpisode,
  loadPrefetchCache,
  savePrefetchCache,
};
