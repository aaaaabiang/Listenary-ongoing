import { apiRequest } from "../config/apiConfig";
import { stripHtml } from "../utils/stripHtml";

function normalizeImageUrl(imageData: any): string {
  const defaultImage =
    "https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/Podcast.svg?alt=media&token=9ad09cc3-2199-436a-b1d5-4eb1a866b3ea";

  if (!imageData) return defaultImage;

  if (typeof imageData === "string" && imageData.startsWith("http")) {
    return imageData;
  }
  if (Array.isArray(imageData) && imageData.length > 0) {
    return normalizeImageUrl(imageData[0]);
  }
  if (typeof imageData === "object" && imageData !== null) {
    if (imageData.url && typeof imageData.url === "string") return imageData.url;
    if (imageData.href && typeof imageData.href === "string") return imageData.href;
    if (
      imageData.$ &&
      imageData.$.href &&
      typeof imageData.$.href === "string"
    )
      return imageData.$.href;
  }
  return defaultImage;
}

function sanitizePodcast(podcast: any) {
  return {
    ...podcast,
    title: stripHtml(podcast?.title),
    author: podcast?.author ? stripHtml(podcast.author) : "",
    description: stripHtml(podcast?.description),
    coverImage: normalizeImageUrl(podcast?.coverImage),
  };
}

export async function fetchTrendingRecommendations() {
  try {
    const response = await apiRequest(
      "/api/podcasts/discover?sort=trending&max=8"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch trending podcasts");
    }
    const data = await response.json();
    const processedData = Array.isArray(data)
      ? data.map((podcast: any) => sanitizePodcast(podcast))
      : [];
    return { success: true, data: processedData };
  } catch (error: any) {
    console.error("Could not load recommendations:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function fetchDiscoverData(
  category: string,
  sort: string,
  lang = "en"
) {
  try {
    const params = new URLSearchParams({ lang, sort });
    if (category && category !== "all") params.append("category", category);

    const response = await apiRequest(
      `/api/podcasts/discover?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch discovery data. Please try again later.");
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to fetch discover data:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function searchPodcasts(term: string) {
  try {
    // 如果没有搜索词，不添加 q 参数（后端会返回全部热门播客）
    const url = term.trim()
      ? `/api/podcasts/search?q=${encodeURIComponent(term)}`
      : `/api/podcasts/search`;
    const response = await apiRequest(url);
    if (!response.ok) {
      throw new Error("Failed to fetch search results. Please try again later.");
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to search podcasts:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function fetchCategories() {
  try {
    const response = await apiRequest("/api/podcasts/categories");
    if (!response.ok) {
      throw new Error("Failed to load categories");
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to load categories:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export const podcastDiscoveryService = {
  fetchTrendingRecommendations,
  fetchDiscoverData,
  searchPodcasts,
  fetchCategories,
};
