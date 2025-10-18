import TranslationAPI from "../api/TranslationAPI";

interface UseTranslationHandlerProps {
  transcriptionData: any[];
  setTargetLanguage: (lang: string) => void;
  setTranslations: (translations: any) => void;
  setTranslatingItems: (items: Set<string>) => void;
}

export function useTranslationHandler({
  transcriptionData,
  setTargetLanguage,
  setTranslations,
  setTranslatingItems
}: UseTranslationHandlerProps) {
  const handleLanguageChange = async (event) => {
    const newTargetLang = event.target.value;
    setTargetLanguage(newTargetLang);
    if (!newTargetLang) {
      setTranslations({});
      setTranslatingItems(new Set());
      return;
    }

    // 准备所有需要翻译的文本
    const textsToTranslate = transcriptionData.map(item => item.text);
    const translatingSet = new Set(textsToTranslate);
    
    setTranslatingItems(translatingSet);

    try {
      const translator = TranslationAPI({
        textToTranslate: textsToTranslate,
        targetLang: newTargetLang,
        onTranslationComplete: (response) => {
          const newTranslations = {};
          
          // 处理翻译结果
          if (response.translations) {
            response.translations.forEach((translation, index) => {
              if (textsToTranslate[index]) {
                newTranslations[textsToTranslate[index]] = translation.text;
              }
            });
          }
          
          // 处理跳过的文本
          if (response.skippedTexts) {
            response.skippedTexts.forEach(skipped => {
              newTranslations[skipped.text] = skipped.reason;
            });
          }
          
          setTranslations(newTranslations);
          setTranslatingItems(new Set());
        },
      });
      translator.translate();
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslatingItems(new Set());
    }
  };

  return { handleLanguageChange };
}
