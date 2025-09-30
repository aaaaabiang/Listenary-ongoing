// server/controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * @desc    一个可复用的辅助函数，用于根据用户ID生成一个 JWT (JSON Web Token)。
 * @param   {string} id - 用户的 MongoDB _id。
 * @returns {string} - 生成的签名 Token。
 */
const generateToken = (id) => {
  // 使用你在 .env 文件中定义的 JWT_SECRET 密钥来为 Token 签名。
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // 设置 Token 的有效期为30天。
  });
};

/**
 * @desc    注册一个新用户。
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  // 从前端发送过来的请求体(body)中，解构出需要的数据。
  const { displayName, email, password } = req.body;

  try {
    // 检查这个邮箱地址是否已经在数据库中存在。
    const userExists = await User.findOne({ email });

    if (userExists) {
      // 如果邮箱已被注册，返回一个 400 (Bad Request) 错误，并附带错误信息。
      return res.status(400).json({ message: '此邮箱已被注册' });
    }
    
    // 如果邮箱是全新的，就使用 User 模型来创建一个新用户实例。
    const user = await User.create({
      displayName,
      email,
      password, // 注意：这里传递的是明文密码。密码的哈希加密由 User 模型中的 pre-save 钩子自动完成。
    });

    // 如果用户被成功创建并存入数据库...
    if (user) {
      // 返回一个 201 (Created) 状态码，表示资源创建成功。
      // 响应体中包含新用户的基本信息和一个全新的“通行证”(Token)。
      res.status(201).json({
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        token: generateToken(user._id), // 为新用户签发一张通行证
      });
    }
  } catch (error) {
    // 如果在创建过程中发生任何错误 (例如，前端传来的数据不符合模型的验证规则)...
    // 返回一个 400 错误，并附带错误信息。
    res.status(400).json({ message: '无效的用户数据', error: error.message });
  }
};

/**
 * @desc    验证用户身份并返回 Token (登录)。
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  // 从请求体中获取用户输入的邮箱和密码。
  const { email, password } = req.body;
  try {
    // 根据邮箱在数据库中查找用户。
    // .select('+password') 是一个关键操作，它告诉 Mongoose:
    // “虽然 User 模型的 password 字段默认是隐藏的(select: false)，但这次为了验证身份，请把加密过的密码也查出来给我。”
    const user = await User.findOne({ email }).select('+password');

    // 检查：1. 用户是否存在；2. 用户输入的密码是否与数据库中加密的密码匹配。
    // (await user.matchPassword(password)) 会调用我们之前在 User 模型中定义的那个自定义方法。
    if (user && (await user.matchPassword(password))) {
      // 如果身份验证成功，返回用户的基本信息和一张新的“通行证”(Token)。
      res.json({
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      // 如果用户不存在或密码错误，返回一个 401 (Unauthorized) 错误，表示认证失败。
      res.status(401).json({ message: '邮箱或密码无效' });
    }
  } catch (error) {
    // 如果服务器在查询过程中发生内部错误...
    // 返回一个 500 (Internal Server Error) 错误。
    res.status(500).json({ message: '服务器错误' });
  }
};

// 将这两个核心功能函数导出，以便路由文件(authRoutes.js)可以使用它们。
module.exports = { registerUser, loginUser };