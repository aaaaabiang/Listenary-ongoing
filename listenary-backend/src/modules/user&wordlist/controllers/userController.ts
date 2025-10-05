// src/modules/user/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

/**
 * 处理获取用户个人资料的 HTTP 请求
 */
export const getUserProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 得益于类型声明，现在 TypeScript 知道 req.user 的类型
    if (!req.user) {
      const error = new Error('用户未找到');
      (error as any).statusCode = 404;
      throw error;
    }
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理获取用户单词本的 HTTP 请求
 */
export const getWordlist = (req: Request, res: Response, next: NextFunction) => {
  try {
    // '!' 非空断言依然可以使用，因为 authMiddleware 保证了在进入此控制器时 req.user 必定存在
    const wordlist = userService.getWordlistForUser(req.user!); 
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
    const updatedWordlist = await userService.addWordToUserWordlist(req.user!, req.body);
    res.status(201).json(updatedWordlist);
  } catch (error) {
    next(error);
  }
};