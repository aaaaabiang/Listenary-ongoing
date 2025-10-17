// 文件路径: listenary-backend/src/modules/podcast-discovery/podcastService.ts

import axios from 'axios';
import crypto from 'crypto';

// Podcast Index API 的基础 URL
const API_URL = 'https://api.podcastindex.org/api/1.0';

/**
 * 生成调用 Podcast Index API 所需的认证请求头。
 * 它会从 .env 文件中读取 API Key 和 Secret，并根据 API 要求生成一个 SHA1 哈希值。
 * 这是所有 API 请求成功的前提。
 */
const generateApiHeaders = () => {
  const apiKey = process.env.PODCAST_INDEX_API_KEY as string;
  const apiSecret = process.env.PODCAST_INDEX_API_SECRET as string;

  // 如果在 .env 文件中找不到必要的密钥，则立即抛出错误。
  // 这会导致调用此函数的任何请求都失败，并向前端返回 500 错误。
  if (!apiKey || !apiSecret) {
    throw new Error('Podcast Index API Key or Secret is not defined in .env');
  }

  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('sha1').update(apiKey + apiSecret + apiHeaderTime).digest('hex');
  
  return {
    'User-Agent': 'ListenaryApp/1.0', // API 推荐的 User-Agent
    'X-Auth-Key': apiKey,
    'X-Auth-Date': apiHeaderTime.toString(),
    'Authorization': hash,
  };
};

/**
 * 一个辅助函数，用于将从 Podcast Index API 获取的播客数据
 * 格式化为前端期望的统一结构。
 * @param feeds - 从 API 响应中获取的播客列表 (response.data.feeds)
 * @returns 格式化后的播客对象数组
 */
const mapFeedsToFrontendFormat = (feeds: any[]) => {
  if (!feeds) return [];
  return feeds.map((feed: any) => ({
    id: feed.id,
    title: feed.title,
    url: feed.url,
    author: feed.author,
    image: feed.image,
    description: feed.description,
    // API 返回的 categories 是一个对象，我们将其转换为前端期望的字符串数组
    categories: feed.categories ? Object.values(feed.categories) : [],
  }));
};

/**
 * 根据搜索词查询播客。
 * @param term - 用户输入的搜索关键词
 * @returns 格式化后的播客列表
 */
export const searchPodcastsByTerm = async (term: string) => {
  try {
    const headers = generateApiHeaders();
    const params = new URLSearchParams({ q: term, max: '200' }); // max: 返回的最大结果数
    const response = await axios.get(`${API_URL}/search/byterm`, { headers, params });
    
    return mapFeedsToFrontendFormat(response.data.feeds);
  } catch (error: any) {
    // 如果请求失败，在后端控制台打印详细错误，并向上抛出
    console.error('Error in searchPodcastsByTerm:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 获取所有可用的播客分类列表。
 * @returns 分类对象数组 (e.g., [{ id: 7, name: 'Arts' }, ...])
 */
export const getPodcastCategories = async () => {
  try {
    const headers = generateApiHeaders();
    const response = await axios.get(`${API_URL}/categories/list`, { headers });
    
    // 根据 API 文档，分类列表在返回数据的 `feeds` 字段中
    return response.data.feeds; 
    
  } catch (error: any) {
    console.error('Error in getPodcastCategories:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 用于“发现”功能，可以获取热门或最新的播客。
 * @param category - 可选，按分类名称筛选
 * @param lang - 可选，按语言筛选 (e.g., 'en')
 * @param sort - 可选，'trending' (热门) 或 'recent' (最新)
 * @returns 格式化后的播客列表
 */
export const discoverPodcasts = async (category?: string, lang?: string, sort?: string) => {
  try {
    // 根据 sort 参数决定使用哪个 API 端点
    const endpoint = sort === 'recent' ? 'recent/feeds' : 'podcasts/trending';
    const headers = generateApiHeaders();
    const params = new URLSearchParams({ max: '200' });

    // 如果提供了参数，则将其添加到请求中
    if (category && category !== 'all') params.append('cat', category);
    if (lang) params.append('lang', lang);

    const response = await axios.get(`${API_URL}/${endpoint}`, { headers, params });

    return mapFeedsToFrontendFormat(response.data.feeds);
  } catch (error: any) {
    console.error('Error in discoverPodcasts:', error.response?.data || error.message);
    throw error;
  }
};