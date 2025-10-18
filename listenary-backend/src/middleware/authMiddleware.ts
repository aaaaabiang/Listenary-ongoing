// src/middleware/authMiddleware.ts
import admin from "../config/firebaseAdmin";
// 修正了 User 模型的导入路径
import User from "../modules/user&wordlist/models/User"; 
import { Request, Response, NextFunction } from "express";

/**
 * @desc    一个 Express 中间件，用于验证 Firebase JWT 并保护路由。
 */
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // 1. 检查请求的 'headers' 中是否存在 'authorization'，并且是以 'Bearer ' 开头。
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. 提取 Token 字符串。
      token = req.headers.authorization.split(" ")[1];

      // 3. 验证 Firebase Token。
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // 4. 从 Firebase token 中获取用户信息
      const firebaseUid = decodedToken.uid;
      const email = decodedToken.email;
      const displayName = decodedToken.name;

      // 5. 查找或创建用户记录
      let user = await User.findOne({ firebaseUid });
      
      if (!user) {
        // 如果用户不存在，创建新用户记录
        user = await User.create({
          firebaseUid,
          email: email || '',
          displayName: displayName || '',
          // 不需要密码字段，因为使用Firebase认证
        });
      }

      // 6. 将用户信息附加到请求对象上
      req.user = user;

      // 7. 调用 next() 将请求传递给下一个处理程序。
      next();
    } catch (error: any) {
      console.error("Token 验证失败:", error.message);
      res.status(401).json({ message: "认证失败，无效的 Token" });
    }
  } else {
    // 如果请求头里连 'Authorization' 字段都没有，直接拒绝。
    res.status(401).json({ message: "认证失败，未提供 Token" });
  }
};

export default authMiddleware;