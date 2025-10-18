import { useState } from "react";

import { apiRequest } from '../config/apiConfig';

export default function TranslationAPI({ textToTranslate, targetLang, onTranslationComplete }){
    // 使用统一的API配置
    const API_URL = "/api/translate";

    const translate = async function() {
        if (!textToTranslate || !targetLang) return '';
        
        try {
            const response = await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify({
                text: [textToTranslate], // 后端要求 text 是字符串数组
                target_lang: targetLang,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Translation request failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText,
                });
                throw new Error(`Translation failed with status: ${response.status}`);
            }

            const data = await response.json();
            const translatedText = data.translations[0].text; //*according to the example response, the translation is in the translations[0].text
            
            if (onTranslationComplete) {
                onTranslationComplete(translatedText);
            }
            
            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            // Add retry logic
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                console.log('Retrying translation...');
                // Wait 1 second before retry
                await new Promise(function(resolve) {
                    setTimeout(resolve, 1000);
                });
                return translate();
            }
            return '';
        }
    };

    return { translate };
}