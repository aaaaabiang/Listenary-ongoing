// src/api/userAPI.tsx
// 用户相关的 API 调用，替换 Firebase Firestore 操作
// 使用 Firebase Auth token 进行认证

import { getAuth } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * 获取 Firebase Auth Token
 */
async function getAuthToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * 获取用户资料
 */
export async function getUserProfile() {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('获取用户资料失败');
  }

  return response.json();
}

/**
 * 保存用户数据（username, savedPodcasts）
 */
export async function saveUserData(data: { 
  displayName?: string; 
  savedPodcasts?: any[] 
}) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('保存用户数据失败');
  }

  return response.json();
}

/**
 * 获取用户单词本
 */
export async function getUserWordlist() {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/wordlist`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('获取单词本失败');
  }

  return response.json();
}

/**
 * 添加单词到单词本
 */
export async function saveWordToUserWordlist(wordData: any) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/wordlist`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wordData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '保存单词失败');
  }

  return response.json();
}

/**
 * 从单词本删除单词
 */
export async function deleteWordFromUserWordlist(wordText: string) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/wordlist/${encodeURIComponent(wordText)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('删除单词失败');
  }

  return response.json();
}

/**
 * 获取收藏的播客列表
 */
export async function getSavedPodcasts() {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/saved-podcasts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('获取收藏播客列表失败');
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
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/saved-podcasts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(podcastData),
  });

  if (!response.ok) {
    throw new Error('添加播客失败');
  }

  return response.json();
}

/**
 * 从收藏中删除播客
 */
export async function removePodcastFromSaved(podcastTitle: string) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/saved-podcasts/${encodeURIComponent(podcastTitle)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('删除播客失败');
  }

  return response.json();
}

