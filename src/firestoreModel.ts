import { api } from './api/http';

export interface UserData {
  savedPodcasts?: any[];
}

export function loadUserData(_uid?: string) {
  return api<UserData>('/user');
}
export function saveUserData(patch: any) {
  return api('/user', { method: 'PUT', body: JSON.stringify(patch) });
}

export const getUserWordlist = loadUserWordlist;
export function loadUserWordlist() {
  return api<any[]>('/user/wordlist');
}
export async function saveWordToUserWordlist(_uid: string, word: any) {
  await api('/user/wordlist', { method: 'POST', body: JSON.stringify(word) });
  return true;
}
export function updateUserWord(_uid: string, id: string, patch: any) {
  return api(`/user/wordlist/${encodeURIComponent(id)}`, {
    method: 'PUT', body: JSON.stringify(patch)
  });
}
export async function deleteWordFromUserWordlist(_uid: string, id: string) {
  await api(`/user/wordlist/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return true;
}

export async function saveRssUrl(url: string) {
  await api('/rss/url', { method: 'POST', body: JSON.stringify({ url }) });
  return true;
}
export async function loadRssUrl() {
  const data = await api<{ url?: string | null }>('/rss/url');
  return data?.url ?? '';
}
export function loadRssFeed(url: string) {
  return api(`/rss/feed?url=${encodeURIComponent(url)}`);
}

export function loadTranscription(podcastId: string) {
  return api(`/transcriptions/${encodeURIComponent(podcastId)}`);
}
export async function saveTranscription(podcastId: string, payload: any) {
  const body = Array.isArray(payload) ? { phrases: payload } : payload; 
  await api(`/transcriptions/${encodeURIComponent(podcastId)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return true;
}

// saveTranscriptionData → saveTranscription
export function saveTranscriptionData(podcastId: string, payload: any) {
  return saveTranscription(podcastId, payload);
}

// === Transcriptions ===

// 拉取“当前用户的所有转录列表”（列表页/频道页用）
export function loadUserTranscriptions() {
  // 后端：GET /api/transcriptions
  return api<any[]>('/transcriptions');
}

export function translateText(payload: { text: string; targetLang: string }) {
  return api('/translate', { method: 'POST', body: JSON.stringify(payload) });
}

export function lookupDictionary(term: string) {
  return api(`/dictionary/lookup?term=${encodeURIComponent(term)}`);
}

export function savePodcastChannelInfo(channelInfo: any) {
  localStorage.setItem('podcastChannelInfo', JSON.stringify(channelInfo));
}
export function loadPodcastChannelInfo() {
  const saved = localStorage.getItem('podcastChannelInfo');
  return saved ? JSON.parse(saved) : null;
}
export function savePodcastEpisodes(episodes: any[]) {
  localStorage.setItem('podcastEpisodes', JSON.stringify(episodes));
}
export function loadPodcastEpisodes() {
  const saved = localStorage.getItem('podcastEpisodes');
  return saved ? JSON.parse(saved) : [];
}
export function saveAudioUrl(url: string) {
  localStorage.setItem('audioUrl', url);
}
export function loadAudioUrl() {
  return localStorage.getItem('audioUrl') || '';
}

export function connectToPersistence(_model?: any) { return true; }