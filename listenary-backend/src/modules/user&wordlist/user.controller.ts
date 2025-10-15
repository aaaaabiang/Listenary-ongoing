// src/modules/user&wordlist/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';

export const getUserProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
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

export const getWordlist = (req: Request, res: Response, next: NextFunction) => {
  try {
    const wordlist = userService.getWordlistForUser(req.user!);
    res.status(200).json(wordlist);
  } catch (error) {
    next(error);
  }
};

export const addWordToWordlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedWordlist = await userService.addWordToUserWordlist(req.user!, req.body);
    res.status(201).json(updatedWordlist);
  } catch (error) {
    next(error);
  }
};


