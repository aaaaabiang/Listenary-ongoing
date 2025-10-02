import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import User from "../models/User";

const router = express.Router();

/**
 * 获取当前登录用户的个人资料
 */
async function getUserProfile(req: Request, res: Response) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: "用户未找到" });
  }
}

/**
 * 获取当前用户的完整单词本
 */
async function getWordlist(req: Request, res: Response) {
  res.status(200).json(req.user!.wordlist);
}

/**
 * 向单词本添加单词
 */
async function addWordToWordlist(req: Request, res: Response) {
  try {
    const wordData = req.body;
    const wordExists = req.user!.wordlist.find(
      (item) => item.word === wordData.word
    );
    if (wordExists) {
      return res.status(400).json({ message: "这个单词已经存在" });
    }
    req.user!.wordlist.push(wordData);
    await req.user!.save();
    res.status(201).json(req.user!.wordlist);
  } catch (error: any) {
    res.status(500).json({ message: "添加单词失败", error: error.message });
  }
}

/**
 * 删除单词
 */
async function deleteWordFromWordlist(req: Request, res: Response) {
  try {
    const wordToDelete = req.params.word;
    req.user!.wordlist = req.user!.wordlist.filter(
      (item) => item.word !== wordToDelete
    );
    await req.user!.save();
    res.status(200).json(req.user!.wordlist);
  } catch (error: any) {
    res.status(500).json({ message: "删除单词失败", error: error.message });
  }
}

// ====== 在这里绑定路由 ======
router.get("/profile", authMiddleware, getUserProfile);
router.get("/wordlist", authMiddleware, getWordlist);
router.post("/wordlist", authMiddleware, addWordToWordlist);
router.delete("/wordlist/:word", authMiddleware, deleteWordFromWordlist);

// ====== 导出 router（而不是单独的函数） ======
export const userRoutes = router;
