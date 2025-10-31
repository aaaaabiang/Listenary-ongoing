import { useState } from "react";
// MongoDB API 调用
import { saveWordToUserWordlist } from "../api/userAPI";
import { dictionaryService } from "../service/dictionaryService";

interface UseWordLookupProps {
  model: any;
}

function normalizeWord(raw: string) {
  // 去掉前后空白 + 两端标点，统一小写；保留 ' 和 -
  return (raw || "")
    .trim()
    .replace(/^[^\w'-]+|[^\w'-]+$/g, "")
    .toLowerCase();
}

export function useWordLookup(model: UseWordLookupProps["model"]) {
  const [wordCard, setWordCard] = useState({
    word: "",
    phonetics: { uk: null, us: null },
    definition: null,
    examples: null,
    relatedTerms: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  function handleWordSelect(word: string) {
    const clean = normalizeWord(word);

    setIsLoading(true);

    // 立即显示当前（清洗后的）单词
    setWordCard({
      word: clean,
      phonetics: { uk: null, us: null },
      definition: null,
      examples: null,
      relatedTerms: null,
    });

    dictionaryService
      .lookupWord(clean)
      .then((result) => {
        if (result.success) {
          model.setDictionaryResult(result.data);
          if (result.data && result.data[0]) {
            setWordCard({
              ...result.data[0],
              word: normalizeWord(result.data[0].word ?? clean),
            });
            return;
          }
        } else {
          model.clearDictionaryResult();
        }

        setWordCard({
          word: clean,
          phonetics: { uk: null, us: null },
          definition: null,
          examples: null,
          relatedTerms: null,
        });
      })
      .catch((error: any) => {
        console.error("Error looking up word:", error);
        model.clearDictionaryResult();
        setWordCard({
          word: clean,
          phonetics: { uk: null, us: null },
          definition: null,
          examples: null,
          relatedTerms: null,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function handleAddToWordlist(wordData: any) {
    // 统一清洗后再提交
    const payload = {
      ...wordData,
      word: normalizeWord(wordData?.word),
    };

    try {
      const result = await saveWordToUserWordlist(payload);
      
      // 检查是否重复
      if (result.isDuplicate) {
        return {
          success: false,
          message: "Already in your wordlist",
          type: "info",
        };
      }
      
      return {
        success: true,
        message: "Added to the default wordlist",
        type: "success",
      };
    } catch (error: any) {
      // 未登录
      if (error?.message?.includes("Authentication")) {
        return {
          success: false,
          message: "Please Login First",
          type: "warning",
        };
      }
      
      // 静默处理其他错误，不输出到控制台
      return {
        success: false,
        message: error?.message || "Failed to save word",
        type: "error",
      };
    }
  }

  return { wordCard, handleWordSelect, handleAddToWordlist, isLoading };
}
