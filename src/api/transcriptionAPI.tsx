// src/api/transcriptionAPI.tsx
// 转录相关的 API 调用，替换 Firebase Firestore 操作
// 使用 Firebase Auth token 进行认证

import { API_BASE_URL, authenticatedApiRequest } from "../config/apiConfig";

/**
 * 保存转录数据到 MongoDB
 */
export async function saveTranscriptionData(
  episodeId: string,
  title: string,
  phrases: any[]
) {
  try {
    // console.log(`保存转录数据 - Episode: ${episodeId}, 短语数量: ${phrases.length}`);

    const response = await authenticatedApiRequest("/api/transcriptions/save", {
      method: "POST",
      body: JSON.stringify({
        episodeId,
        title,
        phrases,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("保存转录数据失败:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `保存转录数据失败: ${errorData.error || response.statusText}`
      );
    }

    const result = await response.json();
    // console.log("转录数据保存成功:", result);
    return result;
  } catch (error) {
    console.error("保存转录数据异常:", error);
    throw error;
  }
}

/**
 * 静默检查转录数据是否存在（不显示404错误）
 */
export async function checkTranscriptionExists(
  episodeId: string
): Promise<boolean> {
  try {
    // 先获取用户的所有转录记录
    const response = await authenticatedApiRequest("/api/transcriptions", {
      method: "GET",
    });

    if (!response.ok) {
      return false;
    }

    const transcriptions = await response.json();
    // 检查是否有匹配的episodeId
    return transcriptions.some((t: any) => t.episodeId === episodeId);
  } catch (error) {
    return false;
  }
}

/**
 * 获取转录数据（只在确认存在时调用）
 */
export async function getTranscriptionData(episodeId: string) {
  try {
    const response = await authenticatedApiRequest(
      `/api/transcriptions/episode/${episodeId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // 404是正常情况，静默处理
        return []; // 没有找到转录数据，返回空数组
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `获取转录数据失败: ${errorData.error || response.statusText}`
      );
    }

    const data = await response.json();
    // console.log(`转录数据获取成功 - Episode: ${episodeId}`);
    return data.phrases || data.sentences || [];
  } catch (error) {
    // 只有在非404错误时才记录
    if (!error.message.includes("404")) {
      console.error(`获取转录数据异常 - Episode: ${episodeId}`, error);
    }
    return [];
  }
}

/**
 * 创建新的转录任务
 */
export async function createTranscriptionTask(params: {
  audioUrl: string;
  episodeId: string;
  rssUrl?: string;
  force?: boolean;
}) {
  try {
    // console.log(`创建转录任务 - Episode: ${params.episodeId}`);

    const response = await authenticatedApiRequest("/api/transcriptions", {
      method: "POST",
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `创建转录任务失败: ${errorData.error || response.statusText}`
      );
    }

    const data = await response.json();
    // console.log(`转录任务创建成功 - Episode: ${params.episodeId}`, data);
    return data;
  } catch (error) {
    console.error(`创建转录任务异常 - Episode: ${params.episodeId}`, error);
    throw error;
  }
}

/**
 * 获取用户的所有转录记录
 */
export async function getUserTranscriptions() {
  const response = await authenticatedApiRequest("/api/transcriptions", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("获取转录列表失败");
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
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("删除转录数据失败");
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
  duration?: number;
}) {
  const { audioUrl, episodeId, rssUrl, duration } = params;
  if (!audioUrl || !episodeId) {
    return Promise.reject(new Error("audioUrl and episodeId are required"));
  }

  return authenticatedApiRequest("/api/transcriptions", {
    method: "POST",
    body: JSON.stringify({
      audioUrl,
      episodeId,
      rssUrl,
      duration,
    }),
  }).then(function (response) {
    if (!response.ok) {
      const errorData = response.json().catch(() => ({}));
      if (response.status === 400) {
        return errorData.then((data: any) => {
          if (data.code === "AUDIO_TOO_LONG") {
            throw new Error(data.error);
          }
          throw new Error(`Transcription API failed: ${response.status}`);
        });
      }
      throw new Error(`Transcription API failed: ${response.status}`);
    }
    return response.json();
  });
}
