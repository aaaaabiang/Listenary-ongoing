import { useState } from "react";

export default function TranslationAPI({ textToTranslate, targetLang, onTranslationComplete }){
    const apiKey = '8dd9ce8e-032f-42ed-af73-c2de472febbf:fx';
    const API_URL = '/deepl/v2/translate';
    // Check if in production environment
    const isProduction = window.location.hostname !== 'localhost';

    const translate = async function() {
        if (!textToTranslate || !targetLang) return '';
        
        try {
            // In production, requests are rewritten by Firebase to cloud functions, so no API key needed
            const headers = isProduction 
                ? { 'Content-Type': 'application/json' }
                : {
                    'Authorization': `DeepL-Auth-Key ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: [textToTranslate], //* text must be an array of strings
                    target_lang: targetLang
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Translation request failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText,
                    isProduction: isProduction
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