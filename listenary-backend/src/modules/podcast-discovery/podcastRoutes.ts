// listenary-backend/src/modules/podcast-discovery/podcastRoutes.ts

import express from 'express';
import { searchPodcasts, getCategories, discoverPodcasts } from './podcastController';

const router = express.Router();

// 现有搜索路由
router.get('/search', searchPodcasts);

// 修正：使用更简洁的 /categories 路由
router.get('/categories', getCategories);

// 新增发现路由
router.get('/discover', discoverPodcasts);

export { router as podcastRoutes }