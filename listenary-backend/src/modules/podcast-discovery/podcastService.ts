// listenary-backend/src/modules/podcast-discovery/podcastService.ts

import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'https://api.podcastindex.org/api/1.0';

const generateApiHeaders = () => {
  const apiKey = process.env.PODCAST_INDEX_API_KEY as string;
  const apiSecret = process.env.PODCAST_INDEX_API_SECRET as string;
  if (!apiKey || !apiSecret) {
    throw new Error('Podcast Index API Key or Secret is not defined in .env');
  }
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('sha1').update(apiKey + apiSecret + apiHeaderTime).digest('hex');
  return {
    'User-Agent': 'ListenaryApp/1.0',
    'X-Auth-Key': apiKey,
    'X-Auth-Date': apiHeaderTime.toString(),
    'Authorization': hash,
  };
};

const mapFeedsToFrontendFormat = (feeds: any[]) => {
  if (!feeds) return [];
  return feeds.map((feed: any) => ({
    id: feed.id,
    title: feed.title,
    url: feed.url,
    author: feed.author,
    image: feed.image,
    description: feed.description,
    // 将 API 返回的 categories 对象的值转换为数组，以匹配前端期望
    categories: feed.categories ? Object.values(feed.categories) : [],
  }));
};

export const searchPodcastsByTerm = async (term: string) => {
  try {
    const headers = generateApiHeaders();
    const params = new URLSearchParams({ q: term, max: '20' });
    const response = await axios.get(`${API_URL}/search/byterm`, { headers, params });
    return mapFeedsToFrontendFormat(response.data.feeds);
  } catch (error: any) {
    console.error('Error in searchPodcastsByTerm:', error.response?.data || error.message);
    throw error; // 向上抛出错误，由控制器处理
  }
};

export const getPodcastCategories = async () => {
  try {
    const headers = generateApiHeaders();
    const response = await axios.get(`${API_URL}/categories/list`, { headers });
    // 修正：根据文档，分类列表在 `feeds` 字段中
    return response.data.feeds; 
  } catch (error: any) {
    console.error('Error in getPodcastCategories:', error.response?.data || error.message);
    throw error;
  }
};

export const discoverPodcasts = async (category?: string, lang?: string, sort?: string) => {
  try {
    const endpoint = sort === 'recent' ? 'recent/feeds' : 'podcasts/trending';
    const headers = generateApiHeaders();
    const params = new URLSearchParams({ max: '20' });

    if (category) params.append('cat', category);
    if (lang) params.append('lang', lang);

    const response = await axios.get(`${API_URL}/${endpoint}`, { headers, params });
    return mapFeedsToFrontendFormat(response.data.feeds);
  } catch (error: any) {
    console.error('Error in discoverPodcasts:', error.response?.data || error.message);
    throw error;
  }
};