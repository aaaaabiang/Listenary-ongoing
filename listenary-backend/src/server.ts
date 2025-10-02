// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';


// 提前加载环境变量
dotenv.config();

// 导入我们自定义的中间件和路由 (假设它们已经被正确转换成了 TS)

import { authRoutes } from './modules/user/controllers/authController';
import { userRoutes } from './modules/user/controllers/userController';
import { notFound, errorHandler } from './middleware/errorMiddleware';
// import { transcriptionRoutes } from './modules/transcription/routes/transcriptionRoutes';

const app = express();
const port = process.env.PORT || 3000;

// --- 全局中间件配置 ---
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: '请求过于频繁，请在15分钟后重试',
});
app.use('/api', limiter);

app.use(cors());
app.use(express.json());

// --- 路由组装 ---
app.get('/', (req: Request, res: Response) => {
  res.send('Listenary TypeScript Backend API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 
// app.use('/api/transcriptions', transcriptionRoutes);

// --- 错误处理 (将在下一阶段添加) ---
// app.use(notFound);
// app.use(errorHandler);

// --- 数据库连接 & 启动服务器 ---
const MONGO_URI = process.env.MONGO_URI;

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