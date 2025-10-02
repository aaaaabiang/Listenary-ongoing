import jwt from "jsonwebtoken";
import User from "../modules/user/models/User"; // 我们需要 User 模型来从数据库中查找用户
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
  //    前端发送 Token 的标准格式就是 "Authorization: Bearer <TOKEN>"。
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. 提取 Token 字符串。
      //    'Bearer <TOKEN>' -> 分割成 ['Bearer', '<TOKEN>'] -> 取出第二个元素。
      token = req.headers.authorization.split("Bearer ")[1];

      // 3. 验证 Token。
      //    jwt.verify 会检查签名是否有效、Token 是否已过期。
      //    如果验证失败，它会直接抛出一个错误，代码会进入下方的 catch 块。
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as jwt.JwtPayload;

      // 4. 【关键步骤】Token 验证成功后，从解码出的 payload ({ id: '...' }) 中获取用户ID。
      //    然后使用这个 ID 从数据库中查找对应的用户。
      //    .select('-password') 是为了确保在任何情况下都不把加密后的密码泄露出去。
      req.user = await User.findById(decoded.id).select("-password");

      // 5. 将用户信息附加到请求对象(req)上之后，调用 next() 函数。
      //    next() 会将请求的处理权交给下一个中间件或最终的路由处理函数 (我们的 Controller)。
      next();
    } catch (error: any) {
      console.error("Token 验证失败:", error.message);
      // 如果 Token 验证失败（伪造的、过期的等），返回 401 Unauthorized 错误。
      res.status(401).json({ message: "认证失败，无效的 Token" });
    }
  }

  // 如果请求头里连 'Authorization' 字段都没有，直接拒绝。
  if (!token) {
    res.status(401).json({ message: "认证失败，未提供 Token" });
  }
};

export default authMiddleware;
