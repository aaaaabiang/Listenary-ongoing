// src/modules/user&wordlist/index.routes.ts
import express from 'express';
import { registerUser, loginUser } from './auth.controller';
import { getUserProfile, getWordlist, addWordToWordlist } from './user.controller';
import authMiddleware from '../../middleware/authMiddleware';

// 顶层聚合：/api/auth 与 /api/user 两组路由
export const authRoutes = (() => {
  const router = express.Router();
  router.post('/register', registerUser);
  router.post('/login', loginUser);
  return router;
})();

export const userRoutes = (() => {
  const router = express.Router();
  router.use(authMiddleware);
  router.get('/profile', getUserProfile);
  router.get('/wordlist', getWordlist);
  router.post('/wordlist', addWordToWordlist);
  return router;
})();




