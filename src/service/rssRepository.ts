import { apiRequest } from "../config/apiConfig";

type RssFeed = any;
type RssItem = any;

export type RssFetchResult = {
  feed: RssFeed | null;
  items: RssItem[];
};

export async function fetchRssFeed(rssUrl: string): Promise<RssFetchResult> {
  const response = await apiRequest(`/api/rss/fetch?url=${encodeURIComponent(rssUrl)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }

  const data = await response.json();
  return {
    feed: data.feedMeta || data.feed || null,
    items: Array.isArray(data.items) ? data.items : [],
  };
}

export const rssRepository = {
  fetchRssFeed,
};
