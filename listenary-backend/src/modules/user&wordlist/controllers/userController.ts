// src/modules/user/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

/**
 * 处理获取用户个人资料的 HTTP 请求
 */
export const getUserProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 只支持Firebase用户
    if (!req.firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    // 返回Firebase用户信息
    res.status(200).json({
      id: req.firebaseUser.uid,
      email: req.firebaseUser.email,
      displayName: req.firebaseUser.name,
      picture: req.firebaseUser.picture,
      email_verified: req.firebaseUser.email_verified,
      authProvider: 'firebase'
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
    // 只支持Firebase用户
    if (!req.firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const wordlist = await userService.getWordlistForUser(req.firebaseUser);
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
    // 只支持Firebase用户
    if (!req.firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const updatedWordlist = await userService.addWordToUserWordlist(req.firebaseUser, req.body);
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
    // 只支持Firebase用户
    if (!req.firebaseUser) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    
    const { wordText } = req.params;
    const updatedWordlist = await userService.deleteWordFromUserWordlist(req.firebaseUser, wordText);
    res.status(200).json(updatedWordlist);
  } catch (error) {
    next(error);
  }
};
