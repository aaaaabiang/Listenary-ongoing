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
import { Transcription } from "../transcriptModel";

// 统一的数据格式转换函数
function formatSentencesToPhrases(sentences: any[] | undefined, resultText?: string) {
  if (Array.isArray(sentences) && sentences.length > 0) {
    return sentences.map((sentence: any) => ({
      text: sentence.text || '',
      offsetMilliseconds: sentence.start ? Math.round(sentence.start * 1000) : 0,
      endOffsetMilliseconds: sentence.end ? Math.round(sentence.end * 1000) : undefined,
    }));
  }
  
  if (resultText) {
    return [{
      text: resultText,
      offsetMilliseconds: 0,
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
    const { audioUrl, episodeId, rssUrl, force, duration } = req.body;

    if (!audioUrl || !episodeId) {
      res
        .status(400)
        .json({ error: "audioUrl and episodeId are required in request body" });
      return;
    }

    // 后端验证音频时长
    if (duration && duration > 1800) {
      res.status(400).json({ 
        error: "Please select a shorter episode (less than 30 minutes).",
        code: "AUDIO_TOO_LONG"
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

    // 查找是否已存在该episode的转录记录
    let transcription = await Transcription.findOne({ 
      userId, 
      episodeId 
    });

    if (transcription) {
      // 更新现有记录
      transcription.status = "done";
      transcription.resultText = phrases.map(p => p.text).join(' ');
      transcription.sentences = phrases.map(phrase => ({
        start: phrase.offsetMilliseconds / 1000, // 转换为秒
        end: (phrase.offsetMilliseconds + 5000) / 1000, // 假设每句5秒
        text: phrase.text,
        speaker: "speaker1"
      }));
      transcription.updatedAt = new Date();
      await transcription.save();
    } else {
      // 创建新记录
      transcription = await Transcription.create({
        userId,
        episodeId,
        audioUrl: `saved_${episodeId}`, // 占位符，因为这是保存的结果
        status: "done",
        resultText: phrases.map(p => p.text).join(' '),
        sentences: phrases.map(phrase => ({
          start: phrase.offsetMilliseconds / 1000,
          end: (phrase.offsetMilliseconds + 5000) / 1000,
          text: phrase.text,
          speaker: "speaker1"
        })),
        meta: {
          title: title,
          savedAt: new Date()
        }
      });
    }

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

// 路由注册 - 使用认证中间件
router.post("/", authMiddleware, createTranscription);
router.post("/save", authMiddleware, saveTranscriptionResult); // 保存转录结果
router.get("/", authMiddleware, getUserTranscriptions); // 获取用户转录列表
router.get("/episode/:episodeId", authMiddleware, getTranscriptionByEpisodeId); // 通过episodeId获取转录记录
router.get("/:id", getTranscriptionById);

export const transcriptionRoutes = router;
