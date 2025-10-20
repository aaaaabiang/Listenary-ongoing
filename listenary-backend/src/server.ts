// src/server.ts

declare const require: any;
declare const process: any;
declare const console: any;

const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
import { rssRoutes } from "./modules/rss/controller";

// 确保在所有其他代码之前加载环境变量
dotenv.config();

// --- 导入所有路由 ---
import { translateRoutes } from "./modules/translation/translateRoutes";
import { authRoutes } from "./modules/user&wordlist/controllers/authController";
import { userRoutes } from "./modules/user&wordlist/controllers/userController";
import { podcastRoutes } from "./modules/podcast-discovery/podcastController";
import { dictionaryRoutes } from "./modules/dictionary/dictionaryController";
import { transcriptionRoutes } from "./modules/transcription/controller/transcriptController";
import { setupTranscriptionWebSocket } from "./modules/transcription/controller/transcriptionWebSocket";

// --- 导入错误处理中间件 ---
import { notFound, errorHandler } from "./middleware/errorMiddleware";

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// --- 全局中间件配置 (按正确顺序) ---

// CORS 配置 - 必须在其他中间件之前
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', 'https://listenary-ongoing-wild-glitter-100.fly.dev');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 1. 安全中间件（在 CORS 之后）
app.use(helmet({
  crossOriginEmbedderPolicy: false // 允许跨域嵌入
}));

// 2. 核心功能中间件
app.use(express.json()); // 解析 JSON 请求体

// 3. 限流中间件 (可选)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 200, // 每个IP在15分钟内最多200次请求
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter); // 只对 /api/ 路径下的请求应用限流

//mounting rss router
app.use("/api/rss", rssRoutes);

// --- 路由组装 (必须在中间件配置之后，错误处理之前) ---

// 根路径和健康检查
app.get("/", (req: any, res: any) => {
  res.send("Listenary TypeScript Backend API is running...");
});
app.get("/healthz", (_: any, res: any) => res.send("ok"));

// 挂载不同模块的路由
app.use("/api/auth", authRoutes); // 处理 /api/auth/* 的请求
app.use("/api/user", userRoutes); // 处理 /api/user/* 的请求
app.use("/api/transcriptions", transcriptionRoutes); // 未来处理 /api/transcriptions/*

app.use("/api/podcasts", podcastRoutes); // 处理 /api/podcasts/* 的请求
app.use("/api/dictionary", dictionaryRoutes);
app.use("/api/translate", translateRoutes);

// --- 错误处理中间件 (必须在所有路由之后) ---
// 3. 只保留一组错误处理器
app.use(notFound); // 捕获 404 错误
app.use(errorHandler); // 统一处理所有其他错误

// --- 数据库连接 & 启动服务器 ---
const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  console.error("Fatal Error: MONGO_URI is not defined in the .env file.");
  process.exit(1);
}

// 4. 将数据库连接和服务器启动逻辑整合在一起
setupTranscriptionWebSocket(server);

mongoose
  .connect(MONGO_URI, { dbName: "listenary" })
  .then(() => {
    console.log("Successfully connected to MongoDB!");
    server.listen(Number(port), '0.0.0.0', () => {
      console.log(`Backend server is running on http://0.0.0.0:${port}`);
    });
  })
  .catch((error: any) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
