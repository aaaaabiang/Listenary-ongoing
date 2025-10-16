// src/modules/user/routes/userRoutes.ts
import express from 'express';
import { getUserProfile, getWordlist, addWordToWordlist } from '../controllers/userController';
import authMiddleware from '../../../middleware/authMiddleware'; // 导入认证中间件

const router = express.Router();

// 核心：在所有用户路由之前应用 authMiddleware。
// 这意味着任何在此文件下定义的路由，都必须先通过 Token 验证。
router.use(authMiddleware);

// 定义具体的路由
// GET /api/user/profile -> 获取登录用户的个人资料
router.get('/profile', getUserProfile);

// GET /api/user/wordlist -> 获取用户的单词本
router.get('/wordlist', getWordlist);

// POST /api/user/wordlist -> 向用户单词本添加一个新单词
router.post('/wordlist', addWordToWordlist);

export { router as userRoutes };