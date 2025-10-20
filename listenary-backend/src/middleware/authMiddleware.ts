// src/middleware/authMiddleware.ts
// 认证中间件 - 合并Firebase认证和MongoDB用户管理

import admin from "../config/firebaseAdmin";
import User from "../modules/user&wordlist/models/User";
import { Request, Response, NextFunction } from "express";

/**
 * 认证中间件
 * 功能：
 * 1. 验证Firebase ID Token
 * 2. 查找或创建MongoDB用户记录
 * 3. 将用户信息附加到请求对象
 * 4. 统一错误处理
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. 检查Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "MISSING_TOKEN",
          message: "认证失败，未提供有效的Firebase Token",
        },
      });
    }

    // 2. 提取并验证Firebase ID Token
    const idToken = authHeader.split("Bearer ")[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN_FORMAT",
          message: "认证失败，Token格式无效",
        },
      });
    }

    // 3. 验证Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 4. 查找或创建MongoDB用户记录
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      // 创建新用户记录（只包含业务数据）
      user = await User.create({
        firebaseUid: decodedToken.uid,
        wordlist: [],
        savedPodcasts: [],
        preferences: {
          language: "en",
          theme: "light",
          notifications: true,
        },
      });
      // console.log(`新用户创建成功: ${decodedToken.uid}`);
    }

    // 5. 将用户信息附加到请求对象
    req.user = user; // MongoDB业务数据

    // 6. 附加Firebase用户信息（用于显示）
    (req as any).firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName:
        (decodedToken as any).name || (decodedToken as any).display_name,
      photoURL:
        (decodedToken as any).picture || (decodedToken as any).photo_url,
      email_verified: decodedToken.email_verified,
    };

    // 7. 继续到下一个中间件
    next();
  } catch (error: any) {
    console.error("统一认证中间件错误:", error.message);

    // 8. 统一错误处理
    let errorCode = "AUTH_ERROR";
    let errorMessage = "认证失败，Token验证错误";

    if (error.code === "auth/id-token-expired") {
      errorCode = "TOKEN_EXPIRED";
      errorMessage = "认证失败，Token已过期";
    } else if (error.code === "auth/invalid-id-token") {
      errorCode = "INVALID_TOKEN";
      errorMessage = "认证失败，无效的Token";
    } else if (error.code === "auth/user-disabled") {
      errorCode = "USER_DISABLED";
      errorMessage = "认证失败，用户已被禁用";
    }

    return res.status(401).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });
  }
};

export default authMiddleware;
