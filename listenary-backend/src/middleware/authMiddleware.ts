// src/middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
// 修正了 User 模型的导入路径
import User from "../modules/user&wordlist/models/User"; 
import { Request, Response, NextFunction } from "express";

/**
 * @desc    一个 Express 中间件，用于验证 JWT 并保护路由。
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

      // 3. 验证 Token。
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as jwt.JwtPayload;

      // 4. 【关键步骤】从数据库中查找用户，并将其附加到请求对象上。
      //    现在 TypeScript 不会再报错，因为它知道 req.user 的存在和类型。
      req.user = await User.findById(decoded.id).select("-password");

      // 5. 调用 next() 将请求传递给下一个处理程序。
      next();
    } catch (error: any) {
      console.error("Token 验证失败:", error.message);
      res.status(401).json({ message: "认证失败，无效的 Token" });
    }
  }

  // 如果请求头里连 'Authorization' 字段都没有，直接拒绝。
  if (!token) {
    res.status(401).json({ message: "认证失败，未提供 Token" });
  }
};

export default authMiddleware;