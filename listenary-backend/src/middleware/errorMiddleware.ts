// src/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * @desc    捕获所有未匹配的路由请求，并创建一个 404 错误。
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`路由未找到 - ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error); // 将错误传递给下一个错误处理中间件
};

/**
 * @desc    统一的错误处理器，捕获所有被 next(error) 传递过来的错误。
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // 如果状态码仍然是 200 OK，说明是某个地方抛出了错误但没有设置错误状态码，
  // 我们将其统一设置为 500 Internal Server Error。
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  res.json({
    message: err.message,
    // 在非生产环境下 (即开发时)，返回详细的错误堆栈信息，方便调试。
    // 在生产环境下，为了安全，不暴露内部实现细节。
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};