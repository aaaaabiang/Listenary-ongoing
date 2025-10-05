import TranslationAPI from "../api/TranslationAPI.js";
export function useTranslationHandler({
  transcriptionData,
  setTargetLanguage,
  setTranslations,
  setTranslatingItems
}) {
  const handleLanguageChange = async (event) => {
    const newTargetLang = event.target.value;
    setTargetLanguage(newTargetLang);
    if (!newTargetLang) {
      setTranslations({});
      setTranslatingItems(new Set());
      return;
    }

    let wordCount = 0;
    const MAX_WORDS = 100;
    const newTranslations = {};
    const translatingSet = new Set();

    for (const item of transcriptionData) {
      const words = item.text.split(/\s+/).length;
      if (wordCount + words > MAX_WORDS) {
        newTranslations[item.text] =
          "Due to API usage limits, only part of the text is translated for reference.";
        continue;
      }
      wordCount += words;
      translatingSet.add(item.text);
    }

    setTranslations(newTranslations);
    setTranslatingItems(translatingSet);

    for (const item of transcriptionData) {
      if (!translatingSet.has(item.text)) continue;
      const translator = TranslationAPI({
        textToTranslate: item.text,
        targetLang: newTargetLang,
        onTranslationComplete: (translatedText) => {
          setTranslations((prev) => ({ ...prev, [item.text]: translatedText }));
          setTranslatingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(item.text);
            return newSet;
          });
        },
      });
      translator.translate();
    }
  };

  return { handleLanguageChange };
}
