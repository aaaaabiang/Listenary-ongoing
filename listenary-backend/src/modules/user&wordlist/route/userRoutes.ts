// src/modules/user/routes/userRoutes.ts
import express from 'express';
import { 
  getUserProfile, 
  getWordlist, 
  addWordToWordlist,
  deleteWordFromWordlist,
  getSavedPodcasts,
  addSavedPodcast,
  removeSavedPodcast
} from '../controllers/userController';
import { firebaseAuthMiddleware } from '../../../middleware/firebaseAuthMiddleware'; // 只使用Firebase认证中间件

const router = express.Router();

// 只使用Firebase认证
router.use(firebaseAuthMiddleware);

// 定义具体的路由
// GET /api/user/profile -> 获取登录用户的个人资料
router.get('/profile', getUserProfile);

// GET /api/user/wordlist -> 获取用户的单词本
router.get('/wordlist', getWordlist);

// POST /api/user/wordlist -> 向用户单词本添加一个新单词
router.post('/wordlist', addWordToWordlist);

// DELETE /api/user/wordlist/:wordText -> 从单词本删除单词
router.delete('/wordlist/:wordText', deleteWordFromWordlist);

// GET /api/user/saved-podcasts -> 获取收藏的播客列表
router.get('/saved-podcasts', getSavedPodcasts);

// POST /api/user/saved-podcasts -> 添加播客到收藏
router.post('/saved-podcasts', addSavedPodcast);

// DELETE /api/user/saved-podcasts/:podcastTitle -> 从收藏中删除播客
router.delete('/saved-podcasts/:podcastTitle', removeSavedPodcast);

export { router as userRoutes };