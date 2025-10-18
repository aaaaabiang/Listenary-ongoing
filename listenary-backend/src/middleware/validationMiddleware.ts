// 数据验证中间件
import { Request, Response, NextFunction } from 'express';

// 验证RSS URL格式
export const validateRssUrl = (req: Request, res: Response, next: NextFunction) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      message: "URL is required",
      code: "MISSING_URL"
    });
  }

  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ 
      message: "Invalid URL format",
      code: "INVALID_URL_FORMAT"
    });
  }

  const rssPatterns = [/\.xml$/i, /\/feed/i, /\/rss/i, /\/podcast/i, /\/itunes/i, /\/feedburner/i];
  if (!rssPatterns.some(pattern => pattern.test(url))) {
    return res.status(400).json({ 
      message: "Invalid RSS URL format. Please provide a valid RSS feed URL.",
      code: "INVALID_RSS_URL"
    });
  }

  next();
};

// 验证单词格式
export const validateWord = (req: Request, res: Response, next: NextFunction) => {
  const { word } = req.params;
  
  if (!word) {
    return res.status(400).json({ 
      message: "Word parameter is missing",
      code: "MISSING_WORD"
    });
  }

  const cleanWord = word.replace(/[^\w'-]/g, "");
  if (!cleanWord) {
    return res.status(400).json({ 
      message: "Invalid word format. Please provide a valid word.",
      code: "INVALID_WORD_FORMAT"
    });
  }

  // 将清理后的单词添加到请求中
  req.params.word = cleanWord;
  next();
};

// 验证音频时长
export const validateAudioDuration = (req: Request, res: Response, next: NextFunction) => {
  const { duration } = req.body;
  
  if (duration && duration > 1800) {
    return res.status(400).json({ 
      message: "Please select a shorter episode (less than 30 minutes).",
      code: "AUDIO_TOO_LONG"
    });
  }

  next();
};

// 验证翻译文本
export const validateTranslationText = (req: Request, res: Response, next: NextFunction) => {
  const { text, target_lang } = req.body;
  
  if (!Array.isArray(text) || text.length === 0) {
    return res.status(400).json({ 
      message: "Text array is required and cannot be empty",
      code: "INVALID_TEXT_ARRAY"
    });
  }

  if (!target_lang) {
    return res.status(400).json({ 
      message: "Target language is required",
      code: "MISSING_TARGET_LANG"
    });
  }

  // 验证文本长度
  const totalLength = text.reduce((sum, t) => sum + (t?.length || 0), 0);
  if (totalLength > 10000) { // 10KB限制
    return res.status(400).json({ 
      message: "Text too long. Please reduce the amount of text to translate.",
      code: "TEXT_TOO_LONG"
    });
  }

  next();
};
