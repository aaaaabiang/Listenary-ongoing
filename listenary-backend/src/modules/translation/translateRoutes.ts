import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// 翻译文本
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, target_lang, source_lang } = req.body;
    if (!Array.isArray(text) || !target_lang) {
      return res.status(400).json({ error: 'Missing text[] or target_lang' });
    }
    
    // 后端处理翻译限制逻辑
    const MAX_WORDS = 100;
    let totalWords = 0;
    const textsToTranslate = [];
    const skippedTexts = [];
    
    for (const textItem of text) {
      const words = textItem.split(/\s+/).length;
      if (totalWords + words > MAX_WORDS) {
        skippedTexts.push({
          text: textItem,
          reason: 'Due to API usage limits, only part of the text is translated for reference.'
        });
        continue;
      }
      totalWords += words;
      textsToTranslate.push(textItem);
    }
    
    const key = process.env.DEEPL_API_KEY;
    if (!key) return res.status(500).json({ error: 'DEEPL_API_KEY not set' });

    // 构建请求体，只有当source_lang存在且不是'auto'时才包含它
    const requestBody: any = { 
      text: textsToTranslate, 
      target_lang
    };
    
    // 只有当source_lang存在且不是'auto'时才添加source_lang参数
    if (source_lang && source_lang !== 'auto') {
      requestBody.source_lang = source_lang;
    }

    console.log('DeepL翻译请求:', requestBody);

    const r = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      requestBody,
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    
    // 返回翻译结果和跳过的文本
    res.json({
      ...r.data,
      skippedTexts: skippedTexts,
      totalWords: totalWords,
      maxWords: MAX_WORDS
    });
  } catch (e: any) {
    console.error('DeepL翻译错误:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({
      error: 'Translation failed',
      details: e.response?.data || e.message,
    });
  }
});

// 获取支持的语言列表
router.get('/languages', async (req: Request, res: Response) => {
  try {
    const key = process.env.DEEPL_API_KEY;
    if (!key) return res.status(500).json({ error: 'DEEPL_API_KEY not set' });

    const r = await axios.get(
      'https://api-free.deepl.com/v2/languages?type=target',
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
        },
        timeout: 10000,
      }
    );
    res.json(r.data);
  } catch (e: any) {
    res.status(e.response?.status || 500).json({
      error: 'Failed to get languages',
      details: e.response?.data || e.message,
    });
  }
});

// 检测语言
router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }
    const key = process.env.DEEPL_API_KEY;
    if (!key) return res.status(500).json({ error: 'DEEPL_API_KEY not set' });

    const r = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      { 
        text: [text], 
        target_lang: 'EN' // 临时目标语言，我们只需要检测源语言
      },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    // 返回检测到的语言
    res.json({
      detected_source_language: r.data.translations[0]?.detected_source_language || 'unknown'
    });
  } catch (e: any) {
    res.status(e.response?.status || 500).json({
      error: 'Language detection failed',
      details: e.response?.data || e.message,
    });
  }
});

export { router as translateRoutes };
