// 这个文件现在只用于localStorage操作，Firestore操作已迁移到后端API

// Save podcast channel info to localStorage
export function savePodcastChannelInfo(channelInfo: any) {
  localStorage.setItem("podcastChannelInfo", JSON.stringify(channelInfo));
}

// Load podcast channel info from localStorage
export function loadPodcastChannelInfo() {
  const savedInfo = localStorage.getItem("podcastChannelInfo");
  return savedInfo ? JSON.parse(savedInfo) : null;
}

// Save podcast episodes to localStorage
export function savePodcastEpisodes(episodes: any) {
  localStorage.setItem("podcastEpisodes", JSON.stringify(episodes));
}

// Load podcast episodes from localStorage
export function loadPodcastEpisodes() {
  const savedEpisodes = localStorage.getItem("podcastEpisodes");
  return savedEpisodes ? JSON.parse(savedEpisodes) : [];
}

// Save RSS URL to localStorage
export function saveRssUrl(url: string) {
  localStorage.setItem("rssUrl", url);
}

// Load RSS URL from localStorage
export function loadRssUrl() {
  return localStorage.getItem("rssUrl") || "";
}

// Save audio URL to localStorage
export function saveAudioUrl(url: string) {
  localStorage.setItem("audioUrl", url);
}

// Load audio URL from localStorage
export function loadAudioUrl() {
  return localStorage.getItem("audioUrl") || "";
}