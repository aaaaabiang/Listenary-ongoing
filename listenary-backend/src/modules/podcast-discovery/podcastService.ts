// listenary-backend/src/modules/podcast-discovery/podcastService.ts

import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'https://api.podcastindex.org/api/1.0';

/**
 * 生成调用 Podcast Index API 所需的认证请求头。
 * @returns {object} 一个用于 API 调用的请求头对象。
 */
const generateApiHeaders = () => {
  const apiKey = process.env.PODCAST_INDEX_API_KEY as string;
  const apiSecret = process.env.PODCAST_INDEX_API_SECRET as string;

  if (!apiKey || !apiSecret) {
    throw new Error('Podcast Index API Key or Secret is not defined in .env');
  }

  // 时间戳需与服务端时间保持在合理范围内。
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const hash = crypto
    .createHash('sha1')
    .update(apiKey + apiSecret + apiHeaderTime)
    .digest('hex');

  return {
    'User-Agent': 'ListenaryApp/1.0',
    'X-Auth-Key': apiKey,
    'X-Auth-Date': apiHeaderTime.toString(),
    'Authorization': hash,
  };
};

/**
 * 帮助函数：将 API 返回的原始数据映射为统一格式。
 * @param {any[]} feeds - 来自 Podcast Index API 的 feed 对象数组。
 * @returns {any[]} 规范化后的播客对象数组。
 */
const mapFeedsToPodcastItems = (feeds: any[]) => {
  return feeds.map((feed: any) => ({
    id: feed.id,
    title: feed.title,
    url: feed.url, // 这是 RSS 地址
    author: feed.author,
    image: feed.image,
    description: feed.description,
    categories: feed.categories,
    lastUpdateTime: feed.lastUpdateTime, // 用于按“最近更新”进行排序
  }));
};

/**
 * 根据搜索词搜索播客，支持可选筛选条件。
 * @param {string} term - 搜索词。
 * @param {string} [lang] - 可选 ISO 639-1 语言代码（例如 'en'）。
 * @param {string} [cat] - 可选分类过滤。
 * @returns {Promise<any[]>} 匹配的播客列表。
 */
export const searchPodcastsByTerm = async (term: string, lang?: string, cat?: string) => {
  try {
    const headers = generateApiHeaders();
    const params = new URLSearchParams({ q: term, max: '20' });

    // 在搜索中追加可选筛选条件
    if (lang) params.append('lang', lang);
    if (cat) params.append('cat', cat);

    const response = await axios.get(`${API_URL}/search/byterm`, {
      headers,
      params,
    });

    if (response.data.status === 'true' && response.data.feeds) {
      return mapFeedsToPodcastItems(response.data.feeds);
    }
    return [];
  } catch (error: any) {
    console.error('Error searching podcasts:', error.response?.data || error.message);
    throw new Error('Failed to search for podcasts.');
  }
};

/**
 * 获取趋势播客列表，支持可选筛选。
 * @param {string} [lang] - 可选 ISO 639-1 语言代码。
 * @param {string} [cat] - 可选分类过滤。
 * @param {number} [max=20] - 返回结果的最大数量。
 * @returns {Promise<any[]>} 趋势播客列表。
 */
export const getTrendingPodcasts = async (lang?: string, cat?: string, max: number = 20) => {
  try {
    const headers = generateApiHeaders();
    const params = new URLSearchParams({ max: max.toString() });

    if (lang) params.append('lang', lang);
    if (cat) params.append('cat', cat);

    const response = await axios.get(`${API_URL}/podcasts/trending`, {
      headers,
      params,
    });
    
    if (response.data.status === 'true' && response.data.feeds) {
      return mapFeedsToPodcastItems(response.data.feeds);
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching trending podcasts:', error.response?.data || error.message);
    throw new Error('Failed to fetch trending podcasts.');
  }
};

/**
 * 从 API 获取所有可用分类的完整列表。
 * @returns {Promise<any[]>} 分类对象列表。
 */
export const getCategories = async () => {
  try {
    const headers = generateApiHeaders();
    const response = await axios.get(`${API_URL}/categories/list`, { headers });

    // 注意：尽管端点名称如此，API 实际在 "feeds" 字段返回分类列表。
    if (response.data.status === 'true' && response.data.feeds) {
      return response.data.feeds;
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    throw new Error('Failed to fetch categories.');
  }
};