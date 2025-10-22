//  •	接收请求，解析参数。
// •	调用 Service。
// •	返回 HTTP 响应。
// •	不写业务逻辑。

// 示例代码：
// const express = require("express");
// const router = express.Router();
// const userService = require("./user.service");

// router.get("/:id", async (req, res) => {
//   try {
//     const user = await userService.getUserById(req.params.id);
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;

import { Router, Request, Response } from "express";
import * as transcriptionService from "../service/transcriptService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { validateAudioDuration } from "../../../middleware/validationMiddleware";
import { Transcription, ITranscription } from "../transcriptModel";
import axios from "axios";

// 统一的数据格式转换函数
function formatSentencesToPhrases(sentences: any[] | undefined, resultText?: string) {
  if (Array.isArray(sentences) && sentences.length > 0) {
    return sentences.map((sentence: any) => {
      const offsetMilliseconds = sentence.start ? Math.round(sentence.start * 1000) : 0;
      const endOffsetMilliseconds = sentence.end ? Math.round(sentence.end * 1000) : undefined;
      
      // 计算时间戳格式
      const totalSeconds = Math.floor(offsetMilliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const timestamp = hours > 0 
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        : `${minutes}:${String(seconds).padStart(2, "0")}`;
      
      return {
        text: sentence.text || '',
        offsetMilliseconds,
        endOffsetMilliseconds,
        timestamp, // 添加格式化后的时间戳
      };
    });
  }
  
  if (resultText) {
    return [{
      text: resultText,
      offsetMilliseconds: 0,
      timestamp: "0:00",
    }];
  }
  
  return [];
}

const router = Router();
/**
 * @route POST /api/transcriptions   // 表示这是一个 POST 请求接口
 * @desc 创建一个新的转写任务（调用外部 API 获取转写结果） // 简要说明接口作用
 * @body { rssUrl: string }          // 说明请求体需要传递的参数
 */
async function createTranscription(req: Request, res: Response) {
  try {
    const { audioUrl, episodeId, rssUrl, force } = req.body;

    if (!audioUrl || !episodeId) {
      res
        .status(400)
        .json({ error: "audioUrl and episodeId are required in request body" });
      return;
    }

    // 从 auth middleware 设置的 req.user 中获取 userId
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const userId = user._id ? String(user._id) : user.id;

    const transcriptionResult =
      await transcriptionService.createOrGetTranscription(
        userId,
        episodeId,
        audioUrl,
        rssUrl,
        Boolean(force)
      );

    const payload =
      typeof transcriptionResult.toObject === "function"
        ? transcriptionResult.toObject()
        : transcriptionResult;

    // 统一数据格式转换逻辑
    const phrases = formatSentencesToPhrases(payload.sentences, payload.resultText);

    res.status(201).json({ ...payload, phrases });
  } catch (err: any) {
    // 发生错误时返回 400 状态码和错误信息
    // Return status 400 and error message if error occurs
    res.status(400).json({ error: err.message });
  }
}

/**
 * @route POST /api/transcriptions/save
 * @desc 保存转录结果到数据库
 * @body { episodeId: string, title: string, phrases: any[] }
 */
async function saveTranscriptionResult(req: Request, res: Response) {
  try {
    const { episodeId, title, phrases } = req.body;

    if (!episodeId || !phrases || !Array.isArray(phrases)) {
      res.status(400).json({ 
        error: "episodeId and phrases array are required in request body" 
      });
      return;
    }

    // 从 auth middleware 设置的 req.user 中获取 userId
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const userId = user._id ? String(user._id) : user.id;

    const sentences = phrases.map((phrase: any) => ({
      start: phrase.offsetMilliseconds / 1000, // 转换为秒
      end: (phrase.offsetMilliseconds + 5000) / 1000, // 假设每句5秒
      text: phrase.text,
      speaker: "speaker1",
    }));
    const resultText = phrases.map((p: any) => p.text).join(" ");

    const existing = await Transcription.findOne({
      userId,
      episodeId,
    });

    const saveExisting = async (doc: ITranscription) => {
      doc.status = "done";
      doc.resultText = resultText;
      doc.sentences = sentences;
      doc.updatedAt = new Date();
      await doc.save();
      return doc;
    };

    const createNew = () =>
      Transcription.create({
        userId,
        episodeId,
        audioUrl: `saved_${episodeId}`, // 占位符，因为这是保存的结果
        status: "done",
        resultText,
        sentences,
        meta: {
          title,
          savedAt: new Date(),
        },
      });

    const transcription = existing ? await saveExisting(existing) : await createNew();

    res.status(200).json({
      message: "转录结果保存成功",
      transcriptionId: transcription._id,
      episodeId: transcription.episodeId,
      status: transcription.status
    });
  } catch (error: any) {
    console.error("保存转录结果失败:", error);
    res.status(500).json({ 
      error: "保存转录结果失败",
      details: error.message 
    });
  }
}

/**
 * @route GET /api/transcriptions
 * @desc 获取当前用户的所有转录记录
 */
async function getUserTranscriptions(req: Request, res: Response) {
  try {
    // 从 auth middleware 设置的 req.user 中获取 userId
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const userId = user._id ? String(user._id) : user.id;

    // 查询该用户的所有转录记录
    const transcriptions = await Transcription.find({ userId })
      .sort({ createdAt: -1 }) // 按创建时间倒序排列
      .select('-__v') // 排除版本字段
      .lean(); // 返回普通对象而不是Mongoose文档

    // 格式化返回数据
    const formattedTranscriptions = transcriptions.map(transcription => ({
      id: transcription._id,
      episodeId: transcription.episodeId,
      audioUrl: transcription.audioUrl,
      status: transcription.status,
      resultText: transcription.resultText,
      rssUrl: transcription.rssUrl,
      sentences: transcription.sentences,
      createdAt: transcription.createdAt,
      updatedAt: transcription.updatedAt,
    }));

    res.status(200).json(formattedTranscriptions);
  } catch (error: any) {
    console.error("获取用户转录列表失败:", error);
    res.status(500).json({ error: "获取转录列表失败" });
  }
}

/**
 * @route GET /api/transcriptions/episode/:episodeId
 * @desc 通过episodeId获取转录记录
 */
async function getTranscriptionByEpisodeId(req: Request, res: Response) {
  try {
    const { episodeId } = req.params;
    
    // 从 auth middleware 设置的 req.user 中获取 userId
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const userId = user._id ? String(user._id) : user.id;

    // 查询该用户的该episode的转录记录
    const transcription = await Transcription.findOne({ 
      userId, 
      episodeId 
    }).lean();

    if (!transcription) {
      res.status(404).json({ 
        message: `No transcription found for episode ${episodeId}` 
      });
      return;
    }

    // 格式化返回数据
    const result = {
      id: transcription._id,
      episodeId: transcription.episodeId,
      status: transcription.status,
      resultText: transcription.resultText,
      sentences: transcription.sentences,
      phrases: formatSentencesToPhrases(transcription.sentences, transcription.resultText),
      createdAt: transcription.createdAt,
      updatedAt: transcription.updatedAt,
    };

    res.status(200).json(result);
  } catch (error: any) {
    console.error("获取转录记录失败:", error);
    res.status(500).json({ 
      error: "获取转录记录失败",
      details: error.message 
    });
  }
}

/**
 * @route GET /api/transcriptions/:id
 * @desc 获取单个转写任务详情（mock，后续会改为查询数据库） // 目前为 mock，后续将查询数据库【待验证】
 */
async function getTranscriptionById(req: Request, res: Response) {
  const id = req.params.id;
  // TODO: 以后将调用数据库查询转写任务详情
  const result = await transcriptionService.getTranscriptionById(id);

  res.status(201).json(result);
}

/**
 * @route GET /api/transcriptions/audio-proxy
 * @desc 音频代理端点 - 解决CORS问题
 */
async function audioProxy(req: Request, res: Response) {
  const audioUrl = req.query.url as string;
  
  if (!audioUrl) {
    return res.status(400).json({ error: "Missing audio URL parameter" });
  }


  try {
    // 验证URL格式
    try {
      new URL(audioUrl);
    } catch (urlError) {
      console.error('Invalid URL format:', audioUrl);
      return res.status(400).json({ 
        error: 'Invalid audio URL format',
        details: 'The provided URL is not valid'
      });
    }

    const response = await axios.get(audioUrl, {
      responseType: 'stream',
      timeout: 30000, // 30秒超时
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });


    // 设置正确的响应头
    res.set({
      'Content-Type': response.headers['content-type'] || 'audio/mpeg',
      'Content-Length': response.headers['content-length'],
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    response.data.pipe(res);
  } catch (error: any) {
    console.error('Audio proxy error for URL:', audioUrl);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.statusText || error.message;
    
    res.status(statusCode).json({ 
      error: 'Failed to proxy audio file',
      details: errorMessage,
      originalUrl: audioUrl,
      statusCode: statusCode
    });
  }
}

// 路由注册 - 使用认证中间件和验证中间件
router.post("/", authMiddleware, validateAudioDuration, createTranscription);
router.post("/save", authMiddleware, saveTranscriptionResult); // 保存转录结果
router.get("/", authMiddleware, getUserTranscriptions); // 获取用户转录列表
router.get("/episode/:episodeId", authMiddleware, getTranscriptionByEpisodeId); // 通过episodeId获取转录记录
router.get("/audio-proxy", audioProxy); // 音频代理端点
router.get("/:id", getTranscriptionById);

export const transcriptionRoutes = router;
