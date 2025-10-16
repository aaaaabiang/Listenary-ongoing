// listenary-backend/src/modules/dictionary/dictionaryController.ts
import { Request, Response, NextFunction, Router } from "express";
import axios from "axios";

export const lookupWord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const word = req.params.word;
    if (!word) {
      return res.status(400).json({ message: "Word parameter is missing." });
    }
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    res.status(200).json(response.data);
  } catch (error: any) {
    // 如果API返回404，我们也返回404，表示未找到
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ message: `No definition found for "${req.params.word}"` });
    }
    next(error); // 其他错误交给全局处理器
  }
};

// 路由注册 — 与 transcriptController.ts 的风格保持一致
const router = Router();
router.get("/:word", lookupWord);

export const dictionaryRoutes = router;
