// src/modules/user/controllers/authController.ts
// 此控制器已废弃 - 现在使用Firebase认证
import { Request, Response, NextFunction, Router } from "express";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(410).json({
    success: false,
    error: {
      code: "DEPRECATED",
      message: "此功能已废弃，请使用Firebase认证"
    }
  });
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(410).json({
    success: false,
    error: {
      code: "DEPRECATED", 
      message: "此功能已废弃，请使用Firebase认证"
    }
  });
};

// 路由注册并导出，保持与项目中其他 controller 的风格一致
const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);

export const authRoutes = router;
