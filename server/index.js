// server/index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 在所有代码的最顶部，加载 .env 文件中的环境变量
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// --- 中间件 ---
app.use(cors());
app.use(express.json());

// --- 从环境变量中安全地获取数据库连接字符串 ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('错误：.env 文件中未定义 MONGO_URI');
}

// --- 异步连接到数据库 ---
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('成功连接到 MongoDB!');
    
    // 只有当数据库连接成功后，才启动 Express 服务器
    app.listen(port, () => {
      console.log(`后端服务器正在 http://localhost:${port} 上运行`);
    });

  } catch (error) {
    console.error('数据库连接失败:', error.message);
    process.exit(1); // 如果连接失败，则退出进程
  }
};

// --- API 路由 ---
app.get('/api', (req, res) => {
  res.json({ message: '你好！后端已连接到数据库！' });
});

// --- 调用函数来连接数据库并启动服务器 ---
connectDB();