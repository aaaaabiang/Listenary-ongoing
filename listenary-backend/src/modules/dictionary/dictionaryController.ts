// listenary-backend/src/modules/dictionary/dictionaryController.ts
import { Request, Response, NextFunction, Router } from "express";
import axios from "axios";
import { validateWord } from "../../middleware/validationMiddleware";

// Merriam-Webster Dictionary API
async function getWordFromMerriamWebster(word: string) {
  try {
    const key = process.env.MERRIAM_WEBSTER_API_KEY;
    if (!key) {
      console.error("Merriam-Webster API key not found");
      return null;
    }

    const response = await axios.get(
      `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}`,
      {
        params: {
          key: key,
        },
        timeout: 15000,
        headers: {
          "User-Agent": "ListenaryApp/1.0",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      return response.data[0]; // 返回第一个结果
    }
    return null;
  } catch (error) {
    console.error("Merriam-Webster API failed:", error);
    return null;
  }
}

// 格式化Merriam-Webster响应
function formatMerriamWebsterResponse(data: any, word: string) {
  if (!data) return null;

  // 提取定义信息 - 使用shortdef字段
  const meanings = [];
  if (data.shortdef && data.shortdef.length > 0) {
    meanings.push({
      partOfSpeech: data.fl || "noun",
      definitions: data.shortdef.map((shortdef: string) => ({
        definition: shortdef,
        example: null,
        synonyms: [],
        antonyms: [],
      })),
    });
  }

  // 如果没有找到定义，提供默认定义
  if (meanings.length === 0) {
    meanings.push({
      partOfSpeech: data.fl || "noun",
      definitions: [
        {
          definition: "Definition not available",
          example: null,
          synonyms: [],
          antonyms: [],
        },
      ],
    });
  }

  const result = {
    word: (data.hwi?.hw || word).replace(/\*/g, ''), // 去除音节分隔符
    phonetic: data.hwi?.prs?.[0]?.mw || null,
    phonetics:
      data.hwi?.prs?.map((pr: any) => ({
        text: pr.mw,
        audio: pr.sound?.audio
          ? `https://media.merriam-webster.com/audio/prons/en/us/mp3/${pr.sound.audio.charAt(
              0
            )}/${pr.sound.audio}.mp3`
          : null,
      })) || [],
    meanings: meanings,
    etymology: data.et?.[0] || null,
    date: data.date || null,
    provider: "Merriam-Webster",
  };

  return result;
}

export const lookupWord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const word = req.params.word; // 已经由验证中间件清理过

    // console.log(`开始查询单词: ${word}`);

    // 直接使用Merriam-Webster API
    const mwData = await getWordFromMerriamWebster(word);
    if (mwData) {
      const formattedResult = formatMerriamWebsterResponse(mwData, word);
      if (formattedResult) {
        // console.log(`Merriam-Webster查询成功 - 单词: ${word}`);
        return res.status(200).json([formattedResult]);
      }
    }

    // Merriam-Webster查询失败
    console.error(`Merriam-Webster查询失败 - 单词: ${word}`);
    res.status(404).json({
      message: `No definition found for "${word}"`,
    });
  } catch (error: any) {
    console.error(`查询失败 - 单词: ${req.params.word}`, error);
    res.status(500).json({
      message: "Dictionary service error",
      details: error.message,
    });
  }
};

// 路由注册 — 与 transcriptController.ts 的风格保持一致
const router = Router();
router.get("/:word", validateWord, lookupWord);

export const dictionaryRoutes = router;
