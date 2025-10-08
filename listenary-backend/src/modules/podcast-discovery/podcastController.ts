// listenary-backend/src/modules/podcast-discovery/podcastController.ts

import { Request, Response, NextFunction } from 'express';
import * as podcastService from './podcastService';

/**
 * 处理播客搜索请求
 */
export const searchPodcasts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerm = req.query.q as string;

    if (!searchTerm) {
      const error = new Error('A search term (query parameter "q") is required.');
      (error as any).statusCode = 400; // Bad Request
      throw error;
    }

    const results = await podcastService.searchPodcastsByTerm(searchTerm);
    res.status(200).json(results);
  } catch (error) {
    next(error); // 将错误传递给全局错误处理器
  }
};