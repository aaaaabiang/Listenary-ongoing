//model.ts — 描述数据结构与 DB schema（TypeScript interface + Mongoose schema 或替代的 ORM model）
import { Schema, model, Document, Types } from "mongoose";

// TypeScript 接口
export interface IFeedItem {
  guid: string;
  title: string;
  link?: string;
  pubDate?: Date | null;
  content?: string;
  enclosure?: any;
  itunes?: {
    duration?: string | number;
    episode?: string | number;
    season?: string | number;
    image?: string;
    summary?: string;
  };
  feedId?: Types.ObjectId | string; // 关联的订阅
  createdAt?: Date;
}

// 订阅（Feed Source）接口 
export interface ISubscription {
  url: string;
  title?: string;
  lastFetchedAt?: Date | null;
  // 可加入 owner 字段（userId）等
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose Documents
export interface FeedItemDoc extends IFeedItem, Document {}
export interface SubscriptionDoc extends ISubscription, Document {}

// FeedItem Schema（持久化条目） 
const FeedItemSchema = new Schema<FeedItemDoc>({
  guid: { type: String, required: true, index: true },
  title: { type: String, required: true },
  link: { type: String },
  pubDate: { type: Date },
  content: { type: String },
  enclosure: { type: Schema.Types.Mixed },
  itunes: { type: Schema.Types.Mixed },
  feedId: { type: Schema.Types.ObjectId, ref: "Subscription" },
}, {
  timestamps: { createdAt: true, updatedAt: false } // 记录抓取时间
});

//保证单个订阅中 guid 唯一，避免重复写入
FeedItemSchema.index({ guid: 1, feedId: 1 }, { unique: true, background: true });


//Subscription Schema
const SubscriptionSchema = new Schema<SubscriptionDoc>({
  url: { type: String, required: true, unique: true },
  title: { type: String },
  lastFetchedAt: { type: Date, default: null },
}, {
  timestamps: true
});

export const FeedItemModel = model<FeedItemDoc>("FeedItem", FeedItemSchema);
export const SubscriptionModel = model<SubscriptionDoc>("Subscription", SubscriptionSchema);
