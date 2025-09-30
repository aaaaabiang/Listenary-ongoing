// server/routes/authRoutes.js

const express = require('express');
const router = express.Router(); // 获取 Express 的路由实例

// 从我们的控制器文件中，引入处理注册和登录逻辑的函数。
const { registerUser, loginUser } = require('../controllers/authController');

/**
 * @desc    注册新用户的路由
 * @route   POST /api/auth/register
 * @access  Public
 * 
 * 当 Express 应用接收到一个指向 '/api/auth/register' 的 POST 请求时，
 * 它会调用 `registerUser` 这个控制器函数来处理该请求。
 */
router.post('/register', registerUser);

/**
 * @desc    用户登录的路由
 * @route   POST /api/auth/login
 * @access  Public
 * 
 * 当 Express 应用接收到一个指向 '/api/auth/login' 的 POST 请求时，
 * 它会调用 `loginUser` 这个控制器函数来处理该请求。
 */
router.post('/login', loginUser);

// 导出配置好的路由模块，以便主文件(index.js)可以使用它。
module.exports = router;