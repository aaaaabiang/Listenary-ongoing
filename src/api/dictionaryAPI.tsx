// src/api/dictionaryAPI.tsx
// 字典相关的 API 调用，使用后端代理

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const DictionaryAPI = {
    async getWord(word) {
        try {
            console.log(`查询字典单词: ${word}`);
            const response = await fetch(`${API_BASE_URL}/api/dictionary/${word}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`单词 "${word}" 未找到`);
                    return null; // 词汇不存在
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`字典查询成功 - 单词: ${word}`, data);
            return data;
        } catch (error) {
            console.error(`字典查询失败 - 单词: ${word}`, error);
            return null;
        }
    }
}