// listenary-backend/src/modules/podcast-discovery/podcastRoutes.ts

import express from 'express';
import { 
  searchPodcasts, 
  getTrending, 
  getCategories 
} from './podcastController';

const router = express.Router();

// --- 定义播客发现模块的所有路由 ---

// 已有路由：通过搜索词搜索播客。
// 示例：GET /api/podcasts/search?q=tech&lang=en
router.get('/search', searchPodcasts);

// 新路由：获取趋势/热门播客。
// 示例：GET /api/podcasts/trending?lang=en&cat=Technology
router.get('/trending', getTrending);

// 新路由：获取所有可用的分类列表。
// 示例：GET /api/podcasts/categories
router.get('/categories', getCategories);

export { router as podcastRoutes };