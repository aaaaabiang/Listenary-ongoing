// src/modules/user/controllers/userController.ts
import { Request, Response, NextFunction, Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';

/**
 * 处理获取用户个人资料的 HTTP 请求
 * 现在只返回Firebase用户信息
 */
export const getUserProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!(req as any).firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    // 只返回Firebase用户信息
    res.status(200).json({
      id: (req as any).firebaseUser.uid,
      email: (req as any).firebaseUser.email,
      displayName: (req as any).firebaseUser.displayName,
      photoURL: (req as any).firebaseUser.photoURL,
      email_verified: (req as any).firebaseUser.email_verified,
      authProvider: 'firebase'
    });
  } catch (error) {
    next(error);
  }
};

// 导入新的Firebase用户服务
import * as firebaseUserService from '../services/firebaseUserService';

/**
 * 处理获取用户单词本的 HTTP 请求
 */
export const getWordlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!(req as any).firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const firebaseUid = (req as any).firebaseUser.uid;
    const wordlist = await firebaseUserService.getUserWordlist(firebaseUid);
    res.status(200).json(wordlist);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理向单词本添加单词的 HTTP 请求
 */
export const addWordToWordlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('添加单词请求:', req.body);
    
    // 检查用户认证状态
    if (!(req as any).firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const firebaseUid = (req as any).firebaseUser.uid;
    console.log('Firebase UID:', firebaseUid);
    
    const updatedWordlist = await firebaseUserService.addWordToUserWordlist(firebaseUid, req.body);
    console.log('更新后的单词本:', updatedWordlist);
    
    res.status(201).json(updatedWordlist);
  } catch (error) {
    console.error('添加单词失败:', error);
    next(error);
  }
};

/**
 * 处理从单词本删除单词的 HTTP 请求
 */
export const deleteWordFromWordlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!(req as any).firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const firebaseUid = (req as any).firebaseUser.uid;
    const { wordText } = req.params;
    const updatedWordlist = await firebaseUserService.deleteWordFromUserWordlist(firebaseUid, wordText);
    res.status(200).json(updatedWordlist);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理获取收藏播客列表的 HTTP 请求
 */
export const getSavedPodcasts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!(req as any).firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const firebaseUid = (req as any).firebaseUser.uid;
    const savedPodcasts = await firebaseUserService.getUserSavedPodcasts(firebaseUid);
    res.status(200).json(savedPodcasts);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理添加播客到收藏的 HTTP 请求
 */
export const addSavedPodcast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!(req as any).firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const firebaseUid = (req as any).firebaseUser.uid;
    const updatedPodcasts = await firebaseUserService.addPodcastToUserSaved(firebaseUid, req.body);
    res.status(201).json(updatedPodcasts);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理从收藏中删除播客的 HTTP 请求
 */
export const removeSavedPodcast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!(req as any).firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const firebaseUid = (req as any).firebaseUser.uid;
    const { podcastTitle } = req.params;
    const updatedPodcasts = await firebaseUserService.removePodcastFromUserSaved(firebaseUid, podcastTitle);
    res.status(200).json(updatedPodcasts);
  } catch (error) {
    next(error);
  }
};

// 路由注册
const router = Router();

// 使用认证中间件
router.use(authMiddleware);

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

export const userRoutes = router;
