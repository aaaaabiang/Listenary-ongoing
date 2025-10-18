// src/api/transcriptionAPI.tsx
// 转录相关的 API 调用，替换 Firebase Firestore 操作
// 使用 Firebase Auth token 进行认证

import { API_BASE_URL, authenticatedApiRequest } from '../config/apiConfig';

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
    
    const response = await authenticatedApiRequest('/api/transcriptions/save', {
      method: 'POST',
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
    
    const response = await authenticatedApiRequest(
      `/api/transcriptions/episode/${episodeId}`,
      {
        method: 'GET',
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
  const response = await authenticatedApiRequest('/api/transcriptions', {
    method: 'GET',
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
  const response = await authenticatedApiRequest(
    `/api/transcriptions/${episodeId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('删除转录数据失败');
  }

  return response.json();
}

/**
 * 语音转文字功能 (兼容旧接口)
 */
export async function speechToText(params: {
  audioUrl: string;
  episodeId: string;
  rssUrl?: string;
}) {
  const { audioUrl, episodeId, rssUrl } = params;
  if (!audioUrl || !episodeId) {
    return Promise.reject(new Error("audioUrl and episodeId are required"));
  }

  return apiRequest('/api/transcriptions', {
    method: "POST",
    body: JSON.stringify({
      audioUrl,
      episodeId,
      rssUrl,
    }),
  }).then(function (response) {
    if (!response.ok) {
      throw new Error(`Transcription API failed: ${response.status}`);
    }
    return response.json();
  });
}

