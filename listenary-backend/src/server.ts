// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

// --- 修正：更新了导入路径以匹配 'user&wordlist' 文件夹 ---
import { authRoutes } from './modules/user&wordlist/routes/authRoutes';
import { userRoutes } from './modules/user&wordlist/routes/userRoutes';
// import { transcriptionRoutes } from './modules/transcription/routes/transcriptionRoutes'; // 未来将启用
import { podcastRoutes } from './modules/podcast-discovery/podcastRoutes'; 

// 从全局中间件文件中导入错误处理函数
import { notFound, errorHandler } from './middleware/errorMiddleware';

const app = express();
const port = Number(process.env.PORT) || 3000;

// 基础中间件（必须在路由前）
app.use(express.json());
app.use(helmet());

// CORS（可选）
const whitelist = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin || whitelist.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));

// 限流（可选）
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

// 健康检查
app.get('/healthz', (_: Request, res: Response) => res.send('ok'));

// 核心：挂载翻译路由（一定要在 404 之前）
app.use('/api/translate', translateRoutes);
console.log('Mounted route: POST /api/translate');

// 根路由（你浏览器看到的那句）
app.get('/', (_: Request, res: Response) => {
  res.send('Listenary TypeScript Backend API is running...');
});

// 挂载不同模块的路由
app.use('/api/auth', authRoutes);         // 处理 /api/auth/* 的请求
app.use('/api/user', userRoutes);           // 处理 /api/user/* 的请求
// app.use('/api/transcriptions', transcriptionRoutes); // 未来处理 /api/transcriptions/*

app.use('/api/podcasts', podcastRoutes); // 处理 /api/podcasts/* 的请求

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