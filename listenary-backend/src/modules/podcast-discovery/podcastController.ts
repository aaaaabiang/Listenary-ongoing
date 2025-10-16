// listenary-backend/src/modules/podcast-discovery/podcastController.ts

import { Request, Response, NextFunction, Router } from "express";
import * as podcastService from "./podcastService";

/**
 * 处理播客搜索请求
 */
export const searchPodcasts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const searchTerm = req.query.q as string;

    if (!searchTerm) {
      const error = new Error(
        'A search term (query parameter "q") is required.'
      );
      (error as any).statusCode = 400; // Bad Request
      throw error;
    }

    const results = await podcastService.searchPodcastsByTerm(searchTerm);
    res.status(200).json(results);
  } catch (error) {
    next(error); // 将错误传递给全局错误处理器
  }
};

// 路由注册并导出，保持与项目中其他 controller 的风格一致
const router = Router();
// 定义搜索路由：GET /api/podcasts/search?q=your_search_term
router.get("/search", searchPodcasts);

export const podcastRoutes = router;
