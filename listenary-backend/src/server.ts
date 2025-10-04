// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

import { translateRoutes } from './modules/translation/translateRoutes'; 

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

// ✅ 核心：挂载翻译路由（一定要在 404 之前）
app.use('/api/translate', translateRoutes);
console.log('Mounted route: POST /api/translate');

// 根路由（你浏览器看到的那句）
app.get('/', (_: Request, res: Response) => {
  res.send('Listenary TypeScript Backend API is running...');
});

// --- 404 & 错误处理：必须放在所有路由之后 ---
import { notFound, errorHandler } from './middleware/errorMiddleware';
app.use(notFound);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on :${port}`);
});
