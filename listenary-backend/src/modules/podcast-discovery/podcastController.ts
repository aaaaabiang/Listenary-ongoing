// listenary-backend/src/modules/podcast-discovery/podcastController.ts

import { Request, Response, NextFunction, Router } from "express";
import * as podcastService from "./podcastService";

// 修正：统一使用 next(error) 进行错误处理
export const searchPodcasts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerm = req.query.q as string;
    if (!searchTerm || !searchTerm.trim()) {
      const error = new Error('Search term (q) is required and cannot be empty.');
      (error as any).statusCode = 400;
      throw error;
    }
    const results = await podcastService.searchPodcastsByTerm(searchTerm);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await podcastService.getPodcastCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const discoverPodcasts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, lang, sort } = req.query;
    const results = await podcastService.discoverPodcasts(category as string, lang as string, sort as string);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

// 路由注册并导出，保持与项目中其他 controller 的风格一致
const router = Router();
// 定义搜索路由：GET /api/podcasts/search?q=your_search_term
router.get("/search", searchPodcasts);

export const podcastRoutes = router;
