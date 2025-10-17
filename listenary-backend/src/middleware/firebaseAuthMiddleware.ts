// src/middleware/firebaseAuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { admin } from "./firebaseAdmin";

/**
 * Firebase认证中间件
 * 验证Firebase ID Token并附加用户信息到请求对象
 */
export const firebaseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 从请求头获取Authorization token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "认证失败，未提供有效的Firebase Token" 
      });
    }

    // 提取token
    const idToken = authHeader.split("Bearer ")[1];
    
    if (!idToken) {
      return res.status(401).json({ 
        message: "认证失败，Token格式无效" 
      });
    }

    // 验证Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // 将用户信息附加到请求对象
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      email_verified: decodedToken.email_verified,
      firebase_uid: decodedToken.uid
    };

    // 继续到下一个中间件
    next();
    
  } catch (error: any) {
    console.error("Firebase Token验证失败:", error.message);
    
    // 根据不同的错误类型返回不同的状态码
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        message: "认证失败，Token已过期" 
      });
    } else if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ 
        message: "认证失败，无效的Token" 
      });
    } else {
      return res.status(401).json({ 
        message: "认证失败，Token验证错误" 
      });
    }
  }
};

// 扩展Request类型以包含firebaseUser
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        uid: string;
        email?: string;
        name?: string;
        picture?: string;
        email_verified?: boolean;
        firebase_uid: string;
      };
    }
  }
}
