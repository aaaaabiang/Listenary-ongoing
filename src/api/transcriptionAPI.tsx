// src/api/transcriptionAPI.tsx
// 转录相关的 API 调用，替换 Firebase Firestore 操作
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
 * 保存转录数据到 MongoDB
 */
export async function saveTranscriptionData(
  episodeId: string,
  title: string,
  phrases: any[]
) {
  try {
    console.log(`保存转录数据 - Episode: ${episodeId}, 短语数量: ${phrases.length}`);
    
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/transcriptions/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        episodeId,
        title,
        phrases,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('保存转录数据失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`保存转录数据失败: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('转录数据保存成功:', result);
    return result;
  } catch (error) {
    console.error('保存转录数据异常:', error);
    throw error;
  }
}

/**
 * 获取转录数据
 */
export async function getTranscriptionData(episodeId: string) {
  try {
    console.log(`获取转录数据 - Episode: ${episodeId}`);
    
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/transcriptions/episode/${episodeId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`未找到转录数据 - Episode: ${episodeId}`);
        return []; // 没有找到转录数据，返回空数组
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`获取转录数据失败: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log(`转录数据获取成功 - Episode: ${episodeId}`, data);
    return data.phrases || data.sentences || [];
  } catch (error) {
    console.error(`获取转录数据异常 - Episode: ${episodeId}`, error);
    return [];
  }
}

/**
 * 获取用户的所有转录记录
 */
export async function getUserTranscriptions() {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/transcriptions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('获取转录列表失败');
  }

  return response.json();
}

/**
 * 删除转录数据
 */
export async function deleteTranscriptionData(episodeId: string) {
  const token = await getAuthToken();
  const response = await fetch(
    `${API_BASE_URL}/api/transcriptions/${episodeId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('删除转录数据失败');
  }

  return response.json();
}

