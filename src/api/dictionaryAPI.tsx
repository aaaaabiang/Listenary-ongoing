// src/api/dictionaryAPI.tsx
// 字典相关的 API 调用，使用后端代理

import { API_BASE_URL, apiRequest } from "../config/apiConfig";

export const DictionaryAPI = {
  async getWord(word) {
    try {
      const response = await apiRequest(`/api/dictionary/${word}`, {
        method: "GET",
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.error(`Word "${word}" not found`);
          return null; // 词汇不存在
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Dictionary query failed - Word: ${word}`, error);
      return null;
    }
  },
};
