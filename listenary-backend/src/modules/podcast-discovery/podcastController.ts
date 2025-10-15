// listenary-backend/src/modules/podcast-discovery/podcastController.ts

import { Request, Response, NextFunction } from 'express';
import * as podcastService from './podcastService';

/**
 * 处理基于搜索词的播客搜索，并支持可选筛选。
 * 读取查询参数 'q'、'lang'、'cat'。
 */
export const searchPodcasts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerm = req.query.q as string;
    const lang = req.query.lang as string | undefined;
    const cat = req.query.cat as string | undefined;

    if (!searchTerm) {
      const error = new Error('需要提供搜索词（查询参数 "q"）。');
      (error as any).statusCode = 400; // 错误请求
      throw error;
    }

    const results = await podcastService.searchPodcastsByTerm(searchTerm, lang, cat);
    res.status(200).json(results);
  } catch (error) {
    next(error); // 将错误传递给全局错误处理器
  }
};

/**
 * 获取趋势播客，支持按语言与分类的可选筛选。
 * 读取查询参数 'lang'、'cat'、'max'。
 */
export const getTrending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang as string | undefined;
    const cat = req.query.cat as string | undefined;
    const max = req.query.max ? parseInt(req.query.max as string, 10) : undefined;

    const results = await podcastService.getTrendingPodcasts(lang, cat, max);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有可用的播客分类列表。
 * 不需要任何查询参数。
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await podcastService.getCategories();
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};