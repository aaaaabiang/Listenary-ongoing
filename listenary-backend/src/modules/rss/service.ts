//service.ts — 业务逻辑：抓取 RSS、解析、缓存、存/取订阅、去重、变更检测等（不做 HTTP 路由）

import Parser from "rss-parser";
import { SubscriptionModel, FeedItemModel } from "./model";
import { Types } from "mongoose";

const parser = new Parser({
  // 可在此处加入 customFields 如需解析 itunes 字段：
  // customFields: { item: ['itunes:duration','itunes:image','itunes:episode','itunes:season','itunes:summary'] }
});

const DEFAULT_MAX_ITEMS = Number(process.env.MAX_ITEMS_PER_FEED ?? 50);

/**
 * 格式化时长为标准格式 HH:MM:SS 或 MM:SS
 * 支持多种输入格式：秒数、"MM:SS"、"HH:MM:SS"、纯数字字符串等
 */
function formatDuration(duration: any): string {
  if (!duration) return "Unknown";

  // 如果是纯数字（秒数）
  if (typeof duration === "number") {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  // 如果是字符串
  if (typeof duration === "string") {
    // 纯数字字符串（秒数）
    if (/^\d+$/.test(duration)) {
      return formatDuration(Number(duration));
    }
    
    // 已经是标准格式 MM:SS 或 HH:MM:SS
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(duration)) {
      const parts = duration.split(':');
      if (parts.length === 2) {
        // MM:SS 格式
        return `${parts[0]}:${parts[1]}`;
      } else if (parts.length === 3) {
        // HH:MM:SS 格式
        return duration;
      }
    }
  }

  return "Unknown";
}

// 解析 URL 并返回映射后的结果（不持久化）
export async function fetchFeedFromUrl(url: string, maxItems = DEFAULT_MAX_ITEMS) {
  const feed = await parser.parseURL(url);
  const items = (feed.items || []).slice(0, maxItems).map(it => {
    const anyIt = it as any;
    
    // 处理 itunes:image - 可能是字符串或对象
    const itunesImageValue = anyIt['itunes:image'] ?? anyIt.itunes?.image;
    let itunesImageUrl: string | undefined = undefined;
    
    if (typeof itunesImageValue === 'string') {
      itunesImageUrl = itunesImageValue;
    } else if (itunesImageValue && typeof itunesImageValue === 'object') {
      itunesImageUrl = itunesImageValue.url || itunesImageValue.href;
    }
    
    // 处理 enclosure（音频附件），其中可能也包含图片
    const enclosureValue = anyIt.enclosure;
    
    // 提取常用字段
    const durationRaw = anyIt['itunes:duration'] ?? anyIt.itunes?.duration;
    const durationValue = formatDuration(durationRaw);  // 格式化时长
    const contentValue = anyIt.contentSnippet ?? anyIt.content;
    
    return {
      guid: anyIt.guid ?? anyIt.id ?? (anyIt.link ?? anyIt.title ?? Math.random().toString(36).slice(2)),
      title: anyIt.title ?? "",
      link: anyIt.link,
      pubDate: anyIt.pubDate ? new Date(anyIt.pubDate) : (anyIt.isoDate ? new Date(anyIt.isoDate) : undefined),
      content: contentValue,
      description: contentValue,  // 兼容前端：description 和 content 都提供
      enclosure: enclosureValue,
      // 添加 image 字段：优先使用 itunes image，其次使用 feed image
      image: itunesImageUrl,
      // 添加 duration 到顶层，方便前端访问（已格式化）
      duration: durationValue,
      // 保留完整的 itunes 信息
      itunes: {
        duration: durationValue,  // 格式化后的时长
        episode: anyIt['itunes:episode'] ?? anyIt.itunes?.episode,
        season: anyIt['itunes:season'] ?? anyIt.itunes?.season,
        image: itunesImageUrl,
        summary: anyIt['itunes:summary'] ?? anyIt.itunes?.summary,
      }
    };
  });

  // 处理 feed image 字段：RSS parser 可能返回对象或字符串
  const imageValue = (feed as any).image;
  let feedImageUrl: string | undefined = undefined;
  
  if (typeof imageValue === 'string') {
    feedImageUrl = imageValue;
  } else if (imageValue && typeof imageValue === 'object') {
    // image 是对象时，提取 url 字段
    feedImageUrl = imageValue.url || imageValue.href || imageValue.link;
  }

  // 为没有图片的 item 添加 feed 的默认图片
  const itemsWithFallbackImage = items.map(item => ({
    ...item,
    image: item.image || feedImageUrl
  }));

  const feedMeta = {
    title: feed.title,
    description: feed.description,
    link: feed.link,
    image: feedImageUrl
  };

  return { feedMeta, items: itemsWithFallbackImage };
}

//创建订阅（若已存在则返回已存在）
export async function createSubscription(url: string, title?: string) {
  const existing = await SubscriptionModel.findOne({ url }).lean();
  if (existing) return existing;
  const created = await SubscriptionModel.create({ url, title });
  return created.toObject();
}

// 列出所有订阅
export async function listSubscriptions() {
  return SubscriptionModel.find().lean();
}

// 删除订阅（同时可选删除已保存条目） 
export async function deleteSubscription(id: string) {
  const sub = await SubscriptionModel.findByIdAndDelete(id);
  if (sub) {
    await FeedItemModel.deleteMany({ feedId: sub._id });
  }
}

// 抓取并持久化：将抓取到的 item upsert 到 DB（去重），返回已插入/存在的条目摘要
export async function fetchAndPersistFeed(subscriptionId: string | Types.ObjectId, url?: string) {
  // 确认订阅存在
  const sub = await SubscriptionModel.findById(subscriptionId);
  if (!sub) throw new Error("Subscription not found");

  const targetUrl = url ?? sub.url;
  const { feedMeta, items } = await fetchFeedFromUrl(targetUrl);

  const saved: any[] = [];
  for (const it of items) {
    try {
      const doc = await FeedItemModel.findOneAndUpdate(
        { guid: it.guid, feedId: sub._id },
        { $setOnInsert: { ...it, feedId: sub._id } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
      saved.push(doc);
    } catch (err: any) {
      if (err.code === 11000) continue; // 唯一键冲突 -> 已存在，忽略
      console.warn("Failed to persist item", err);
    }
  }

  sub.lastFetchedAt = new Date();
  await sub.save();

  return { feedMeta, saved };
}

// 从 DB 读取某订阅的条目（最近 N 条）
export async function listItemsBySubscription(subscriptionId: string | Types.ObjectId, limit = 50) {
  return FeedItemModel.find({ feedId: subscriptionId }).sort({ pubDate: -1 }).limit(limit).lean();
}