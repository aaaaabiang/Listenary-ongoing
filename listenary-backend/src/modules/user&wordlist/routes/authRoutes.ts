// src/modules/user&wordlist/routes/authRoutes.ts

import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// 关键：将配置好的 router 实例作为 authRoutes 导出
export { router as authRoutes };