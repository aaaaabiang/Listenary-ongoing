// src/modules/user/controllers/authController.ts
// 认证控制器 - 提供认证状态检查端点
import { Request, Response, Router } from "express";

/**
 * 检查用户认证状态
 * GET /api/auth/status
 */
export const checkAuthStatus = async (req: Request, res: Response) => {
  try {
    // 这个端点不需要认证中间件，用于检查用户是否已登录
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        success: false,
        authenticated: false,
        message: "未提供认证令牌"
      });
    }

    // 如果有认证令牌，返回成功状态
    res.json({
      success: true,
      authenticated: true,
      message: "用户已认证"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "AUTH_CHECK_ERROR",
        message: "认证状态检查失败"
      }
    });
  }
};

// 路由注册
const router = Router();
router.get("/status", checkAuthStatus);

export const authRoutes = router;
