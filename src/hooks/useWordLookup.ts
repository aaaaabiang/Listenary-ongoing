import { useState } from "react";
// MongoDB API 调用
import { saveWordToUserWordlist } from "../api/userAPI";
import loginModel from "../loginModel";

interface UseWordLookupProps {
  model: any;
}

function normalizeWord(raw: string) {
  // 去掉前后空白 + 两端标点，统一小写；保留词中间的 ' 和 -
  return (raw || "")
    .trim()
    .replace(/^[^\w'-]+|[^\w'-]+$/g, "")
    .toLowerCase();
}

export function useWordLookup(model: UseWordLookupProps['model']) {
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
    console.log("Looking up word:", clean);

    setIsLoading(true);

    // 立即显示当前（清洗后的）单词
    setWordCard({
      word: clean,
      phonetics: { uk: null, us: null },
      definition: null,
      examples: null,
      relatedTerms: null,
    });

    model
      .lookupWord(clean)
      .then((result: any[]) => {
        console.log("Dictionary API result:", result);
        if (result && result[0]) {
          setWordCard({
            ...result[0],
            // 确保回填的主键仍为清洗后的词
            word: normalizeWord(result[0].word ?? clean),
          });
        } else {
          setWordCard({
            word: clean,
            phonetics: { uk: null, us: null },
            definition: null,
            examples: null,
            relatedTerms: null,
          });
        }
      })
      .catch((error: any) => {
        console.error("Error looking up word:", error);
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
    // 统一清洗后再提交，避免 “myself.”、“easy,” 这类带标点的重复与 400
    const payload = {
      ...wordData,
      word: normalizeWord(wordData?.word),
    };

    try {
      await saveWordToUserWordlist(payload);
      return { success: true, message: "Added to the default wordlist", type: "success" };
    } catch (error: any) {
      console.error("Error saving word to wordlist:", error);

      // 未登录
      if (error?.message?.includes("Authentication")) {
        return { success: false, message: "Please Login First", type: "warning" };
      }
      // 已存在（后端返回 400/提示时）
      if (error?.message?.includes("已经存在") || error?.message?.toLowerCase?.().includes("already")) {
        return { success: false, message: "Already in your wordlist", type: "info" };
      }
      return { success: false, message: error?.message || "Failed to save word", type: "error" };
    }
  }

  return { wordCard, handleWordSelect, handleAddToWordlist, isLoading };
}
