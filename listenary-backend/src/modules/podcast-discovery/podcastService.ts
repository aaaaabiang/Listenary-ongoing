// listenary-backend/src/modules/podcast-discovery/podcastService.ts

import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'https://api.podcastindex.org/api/1.0';

/**
 * 生成 Podcast Index API 所需的认证头
 * @returns {object} 包含 Authorization, User-Agent, 和 X-Auth-Key 的请求头对象
 */
const generateApiHeaders = () => {
  const apiKey = process.env.PODCAST_INDEX_API_KEY as string;
  const apiSecret = process.env.PODCAST_INDEX_API_SECRET as string;

  if (!apiKey || !apiSecret) {
    throw new Error('Podcast Index API Key or Secret is not defined in .env');
  }

  // 根据文档，Authorization Header 是 apiKey + apiSecret + apiHeaderTime 的 SHA-1 哈希值
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
 * 根据关键词搜索播客
 * @param {string} term - 搜索的关键词
 * @returns {Promise<any[]>} - 包含播客信息的数组，每个对象包含 title, url (RSS地址), 等
 */
export const searchPodcastsByTerm = async (term: string) => {
  try {
    const headers = generateApiHeaders();
    const params = new URLSearchParams({ q: term, max: '20' }); // 限制最多返回20条结果

    const response = await axios.get(`${API_URL}/search/byterm`, {
      headers,
      params,
    });

    if (response.data.status === 'true' && response.data.feeds) {
      // 提取并返回我们需要的信息
      return response.data.feeds.map((feed: any) => ({
        id: feed.id,
        title: feed.title,
        url: feed.url, // 这是 RSS 地址
        author: feed.author,
        image: feed.image,
        description: feed.description,
        categories: feed.categories,
      }));
    }
    return [];
  } catch (error: any) {
    console.error('Error searching podcasts:', error.response?.data || error.message);
    throw new Error('Failed to search for podcasts.');
  }
};