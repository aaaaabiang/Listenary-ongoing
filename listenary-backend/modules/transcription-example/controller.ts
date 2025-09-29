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
const router = Router();
/**
 * @route POST /api/transcriptions   // 表示这是一个 POST 请求接口
 * @desc 创建一个新的转写任务（mock） // 简要说明接口作用
 * @body { rssUrl: string }          // 说明请求体需要传递的参数
 */
async function createTranscription(req: Request, res: Response) {
  const rssUrl = req.body.rssUrl;

  // TODO: 将来从登录 token 获取 userId
  const userId = "mock-user-123";

  res.status(201).json({
    // 返回创建成功的转写任务信息（mock）
    id: "mock-transcription-id-1",
    userId: userId,
    rssUrl: rssUrl,
    audioUrl: "https://example.com/audio.mp3",
    status: "processing",
  });
}

/**
 * @route GET /api/transcriptions/:id
 * @desc 获取单个转写任务详情（mock）
 */
async function getTranscriptionById(req: Request, res: Response) {
  const id = req.params.id;

  res.json({
    id: id,
    userId: "mock-user-123",
    rssUrl: "https://example.com/feed.xml",
    audioUrl: "https://example.com/audio.mp3",
    status: "done",
    resultText: "这是转写结果文本（mock）",
  });
}

// 路由注册
router.post("/", createTranscription);
router.get("/:id", getTranscriptionById);

export const transcriptionRoutes = router;
