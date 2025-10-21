// src/api/userAPI.tsx
// 用户相关的 API 调用，替换 Firebase Firestore 操作
// 使用 Firebase Auth token 进行认证

import { authenticatedApiRequest } from "../config/apiConfig";

/**
 * 获取用户资料
 */
export async function getUserProfile() {
  const response = await authenticatedApiRequest("/api/user/profile", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to get user profile");
  }

  return response.json();
}

/**
 * 保存用户数据（username, savedPodcasts）
 */
export async function saveUserData(data: {
  displayName?: string;
  savedPodcasts?: any[];
}) {
  const response = await authenticatedApiRequest("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to save user data");
  }

  return response.json();
}

/**
 * 获取用户单词本
 */
export async function getUserWordlist() {
  const response = await authenticatedApiRequest("/api/user/wordlist", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to get wordlist");
  }

  return response.json();
}

/**
 * 添加单词到单词本
 */
export async function saveWordToUserWordlist(wordData: any) {
  const response = await authenticatedApiRequest("/api/user/wordlist", {
    method: "POST",
    body: JSON.stringify(wordData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to save word");
  }

  return response.json();
}

/**
 * 从单词本删除单词
 */
export async function deleteWordFromUserWordlist(wordText: string) {
  const response = await authenticatedApiRequest(
    `/api/user/wordlist/${encodeURIComponent(wordText)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete word");
  }

  return response.json();
}

/**
 * 获取收藏的播客列表
 */
export async function getSavedPodcasts() {
  const response = await authenticatedApiRequest("/api/user/saved-podcasts", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to get saved podcasts");
  }

  return response.json();
}

/**
 * 添加播客到收藏
 */
export async function addPodcastToSaved(podcastData: {
  title: string;
  rssUrl: string;
  coverImage?: string;
  description?: string;
}) {
  const response = await authenticatedApiRequest("/api/user/saved-podcasts", {
    method: "POST",
    body: JSON.stringify(podcastData),
  });

  if (!response.ok) {
    const errorMessage = await response.json().then(
      (errorBody) => errorBody?.message || "Failed to add podcast",
      () => "Failed to add podcast"
    );
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * 从收藏中删除播客
 */
export async function removePodcastFromSaved(podcastTitle: string) {
  const response = await authenticatedApiRequest(
    `/api/user/saved-podcasts/${encodeURIComponent(podcastTitle)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete podcast");
  }

  return response.json();
}
