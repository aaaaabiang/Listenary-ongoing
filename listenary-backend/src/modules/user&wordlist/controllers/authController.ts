// src/modules/user/controllers/authController.ts
import { Request, Response, NextFunction, Router } from "express";
import * as authService from "../services/authService";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error); // 将错误传递给全局错误处理器
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error); // 将错误传递给全局错误处理器
  }
};

// 路由注册并导出，保持与项目中其他 controller 的风格一致
const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);

export const authRoutes = router;
