// server/index.js

// 核心依赖引入
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 引入 dotenv 来加载 .env 文件中的环境变量。
// require('dotenv').config() 应该尽可能早地被调用。
require('dotenv').config();

// 引入我们为不同功能模块创建的路由文件
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// const transcriptionRoutes = require('./routes/transcriptionRoutes'); // 未来会添加这个

// 创建 Express 应用实例
const app = express();

// 从环境变量中获取端口号，如果未定义，则默认为 3000
const port = process.env.PORT || 3000;

// --- 中间件 (Middleware) 配置 ---
// 启用 CORS，允许前端应用跨域访问我们的 API
app.use(cors());
// 启用 Express 内置的 JSON 解析器，用于解析 POST 请求的 body
app.use(express.json());

// --- 路由 (Routes) 组装 ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 


// --- 根路由 (可选的测试路由) ---
app.get('/', (req, res) => {
  res.send('Listenary Backend API is running...');
});


// --- 数据库连接 & 启动服务器 ---
const MONGO_URI = process.env.MONGO_URI;

// 检查 MONGO_URI 是否存在，如果不存在则抛出错误，防止应用在没有数据库连接的情况下启动。
if (!MONGO_URI) {
  throw new Error('FATAL ERROR: MONGO_URI is not defined in .env file.');
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('成功连接到 MongoDB!');
    // 只有当数据库连接成功后，才启动 Express 服务器的监听。
    app.listen(port, () => {
      console.log(`后端服务器正在 http://localhost:${port} 上运行`);
    });
  })
  .catch((error) => {
    console.error('数据库连接失败:', error.message);
    process.exit(1); // 如果数据库连接失败，则退出程序，因为应用无法在没有数据库的情况下正常工作。
  });