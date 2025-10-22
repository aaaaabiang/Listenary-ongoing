import { useState } from "react";

import { apiRequest } from "../config/apiConfig";

export default function TranslationAPI({
  textToTranslate,
  targetLang,
  onTranslationComplete,
}) {
  // 使用统一的API配置
  const API_URL = "/api/translate";

  const translate = async function () {
    if (!textToTranslate || !targetLang) return "";

    try {
      // 确保textToTranslate是数组格式
      const texts = Array.isArray(textToTranslate)
        ? textToTranslate
        : [textToTranslate];

      const response = await apiRequest(API_URL, {
        method: "POST",
        body: JSON.stringify({
          text: texts, // 后端要求 text 是字符串数组
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Translation request failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
        });
        throw new Error(`Translation failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (onTranslationComplete) {
        onTranslationComplete(data);
      }

      // 如果是单个文本，返回第一个翻译结果
      if (Array.isArray(textToTranslate) && textToTranslate.length === 1) {
        return data.translations[0].text;
      }

      return data;
    } catch (error) {
      console.error("Translation error:", error);
      // Add retry logic
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("CORS")
      ) {
        // Wait 1 second before retry
        await new Promise(function (resolve) {
          setTimeout(resolve, 1000);
        });
        return translate();
      }
      return "";
    }
  };

  return { translate };
}
