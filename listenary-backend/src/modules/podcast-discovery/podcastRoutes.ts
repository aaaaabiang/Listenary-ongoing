// listenary-backend/src/modules/podcast-discovery/podcastRoutes.ts

import express from 'express';
import { searchPodcasts } from './podcastController';
// 我们可以添加认证中间件，但对于公共搜索功能，暂时不需要
// import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

// 定义搜索路由：GET /api/podcasts/search?q=your_search_term
router.get('/search', searchPodcasts);

export { router as podcastRoutes };