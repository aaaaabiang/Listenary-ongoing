// src/modules/user/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error); // 将错误传递给全局错误处理器
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error); // 将错误传递给全局错误处理器
    }
};