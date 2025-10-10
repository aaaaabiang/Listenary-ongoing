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
    const { audioUrl, episodeId, rssUrl, force } = req.body;

    if (!audioUrl || !episodeId) {
      res
        .status(400)
        .json({ error: "audioUrl and episodeId are required in request body" });
      return;
    }

    // TODO: 将来从登录 token 获取 userId
    const userId = "65fd3a2b9f1c2a0012ab3456";

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

    const phrases = Array.isArray(payload.sentences) && payload.sentences.length
      ? payload.sentences.map(function (sentence: any) {
          return {
            text: sentence.text,
            offsetMilliseconds: sentence.start
              ? Math.round(sentence.start * 1000)
              : 0,
          };
        })
      : payload.resultText
      ? [
          {
            text: payload.resultText,
            offsetMilliseconds: 0,
          },
        ]
      : [];

    res.status(201).json({ ...payload, phrases });
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
