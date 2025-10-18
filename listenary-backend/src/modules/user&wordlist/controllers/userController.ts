// src/modules/user/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

/**
 * 处理获取用户个人资料的 HTTP 请求
 * 现在返回Firebase用户信息 + MongoDB业务数据
 */
export const getUserProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!(req as any).firebaseUser || !req.user) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    // 返回Firebase用户信息 + MongoDB业务数据
    res.status(200).json({
      // Firebase用户信息（用于显示）
      id: (req as any).firebaseUser.uid,
      email: (req as any).firebaseUser.email,
      displayName: (req as any).firebaseUser.displayName,
      photoURL: (req as any).firebaseUser.photoURL,
      email_verified: (req as any).firebaseUser.email_verified,
      authProvider: 'firebase',
      
      // MongoDB业务数据
      preferences: req.user.preferences,
      wordlistCount: req.user.wordlist.length,
      savedPodcastsCount: req.user.savedPodcasts.length,
      createdAt: (req.user as any).createdAt,
      updatedAt: (req.user as any).updatedAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 处理获取用户单词本的 HTTP 请求
 */
export const getWordlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!req.user) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    // 直接返回MongoDB中的单词本数据
    res.status(200).json(req.user.wordlist);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理向单词本添加单词的 HTTP 请求
 */
export const addWordToWordlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!req.user) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const updatedWordlist = await userService.addWordToUserWordlist(req.user, req.body);
    res.status(201).json(updatedWordlist);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理从单词本删除单词的 HTTP 请求
 */
export const deleteWordFromWordlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查用户认证状态
    if (!req.user) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const { wordText } = req.params;
    const updatedWordlist = await userService.deleteWordFromUserWordlist(req.user, wordText);
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
    if (!req.user) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    // 直接返回MongoDB中的收藏播客数据
    res.status(200).json(req.user.savedPodcasts);
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
    if (!req.user) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const updatedPodcasts = await userService.addPodcastToSaved(req.user, req.body);
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
    if (!req.user) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const { podcastTitle } = req.params;
    const updatedPodcasts = await userService.removePodcastFromSaved(req.user, podcastTitle);
    res.status(200).json(updatedPodcasts);
  } catch (error) {
    next(error);
  }
};
