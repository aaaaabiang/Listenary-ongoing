// src/server.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 确保在所有其他代码之前加载环境变量
dotenv.config();

// --- 修正：更新了导入路径以匹配 'user&wordlist' 文件夹 ---
import { authRoutes } from './modules/user&wordlist/routes/authRoutes';
import { userRoutes } from './modules/user&wordlist/routes/userRoutes';
// import { transcriptionRoutes } from './modules/transcription/routes/transcriptionRoutes'; // 未来将启用
import { podcastRoutes } from './modules/podcast-discovery/podcastRoutes'; 
import { dictionaryRoutes } from './modules/dictionary/dictionaryRoutes';

// 从全局中间件文件中导入错误处理函数
import { notFound, errorHandler } from './middleware/errorMiddleware';

const app = express();
const port = process.env.PORT || 3000;

// --- 全局中间件配置 (按正确顺序) ---

// 1. 安全中间件
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 200, // 每个IP在15分钟内最多200次请求
  message: '请求过于频繁，请在15分钟后重试',
});
app.use('/api', limiter); // 只对 /api/ 路径下的请求进行限制

// 2. 核心功能中间件
app.use(cors()); // 启用跨域资源共享
app.use(express.json()); // 解析 JSON 格式的请求体

// --- 路由组装 ---

// 根路径，用于简单的健康检查
app.get('/', (req: Request, res: Response) => {
  res.send('Listenary TypeScript Backend API is running...');
});

// 挂载不同模块的路由
app.use('/api/auth', authRoutes);         // 处理 /api/auth/* 的请求
app.use('/api/user', userRoutes);           // 处理 /api/user/* 的请求
// app.use('/api/transcriptions', transcriptionRoutes); // 未来处理 /api/transcriptions/*

app.use('/api/podcasts', podcastRoutes); // 处理 /api/podcasts/* 的请求
app.use('/api/dictionary', dictionaryRoutes);

// --- 错误处理中间件 (必须在所有路由之后) ---
app.use(notFound);      // 捕获 404 错误
app.use(errorHandler);  // 统一处理所有其他错误

// --- 数据库连接 & 启动服务器 ---
const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error('致命错误: .env 文件中未定义 MONGO_URI');
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('成功连接到 MongoDB!');
    app.listen(port, () => {
      console.log(`后端服务器正在 http://localhost:${port} 上运行`);
    });
  })
  .catch((error) => {
    console.error('数据库连接失败:', error);
    process.exit(1);
  });