/**
 * 此文件现在主要用于：
 * 1. localStorage 缓存功能（RSS、播客信息等）
 * 2. Transcription 数据的 Firestore 存储（待验证后可能迁移到 MongoDB）
 * 
 * 已废弃的 Firestore 用户数据和单词本功能已迁移到 MongoDB
 */

/*避免重复请求服务器（节省网络资源，加快加载速度）；

在用户刷新或重启浏览器后仍保留数据（localStorage 持久存在）；

减少对后端依赖，提升响应速度；

临时离线可用（在无网络时还能读取上次缓存的数据）。*/

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseApp";
export { db }; // 导出 db 供其他模块使用

// ============================================
// Transcription 相关 - Firestore（待验证）
// ============================================

// 保存转录数据到 Firestore
export async function saveTranscriptionData(uid: string, guid: string, title: any, phrases: any) {
  const docRef = doc(db, "users", uid, "transcriptions", guid);
  try {
    await setDoc(docRef, {
      title: title,
      phrases: phrases,
      updatedAt: new Date(),
    });
    console.log(`Transcription saved for episode ${title}`);
  } catch (err) {
    console.error(err);
  }
}

// 获取转录数据从 Firestore
export async function getTranscriptionData(uid: string, guid: string) {
  const docRef = doc(db, "users", uid, "transcriptions", guid);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().phrases || [];
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

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
