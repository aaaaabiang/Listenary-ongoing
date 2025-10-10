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
import * as transcriptionService from "./transcriptService";

const router = Router();
/**
 * @route POST /api/transcriptions   // 表示这是一个 POST 请求接口
 * @desc 创建一个新的转写任务（调用外部 API 获取转写结果） // 简要说明接口作用
 * @body { rssUrl: string }          // 说明请求体需要传递的参数
 */
async function createTranscription(req: Request, res: Response) {
  try {
    const rssUrl = req.body.rssUrl;

    // TODO: 将来从登录 token 获取 userId
    const userId = "65fd3a2b9f1c2a0012ab3456";
    //仅供调试
    const episodeId = "test-episode-003";
    const audioUrl =
      "https://op3.dev/e/episodes.captivate.fm/episode/4d32de1b-a809-4dce-a053-69a3eb7c3a98.mp3";

    // 调用新的服务函数 createOrGetTranscription，保证同一用户同一 episode 只保存一条结果，避免重复转写
    const transcriptionResult =
      await transcriptionService.createOrGetTranscription(
        userId,
        episodeId,
        audioUrl,
        rssUrl
      );

    res.status(201).json(transcriptionResult);
  } catch (err: any) {
    // 发生错误时返回 400 状态码和错误信息
    // Return status 400 and error message if error occurs
    res.status(400).json({ error: err.message });
  }
}

/**
 * @route GET /api/transcriptions/:id
 * @desc 获取单个转写任务详情（mock，后续会改为查询数据库） // 目前为 mock，后续将查询数据库
 */
async function getTranscriptionById(req: Request, res: Response) {
  const id = req.params.id;
  // TODO: 以后将调用数据库查询转写任务详情
  const result = await transcriptionService.getTranscriptionById(id);

  res.status(201).json(result);
}

// 路由注册
router.post("/", createTranscription);
router.get("/:id", getTranscriptionById);

export const transcriptionRoutes = router;
