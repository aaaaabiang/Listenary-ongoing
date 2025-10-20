// src/modules/user/models/User.ts

import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

// 定义 word 子文档的 TypeScript 接口
interface IWord extends Types.Subdocument {
  word: string;
  phonetic?: string;
  phonetics?: object[];
  meanings?: object[];
}

// 定义 podcast 子文档的 TypeScript 接口
interface IPodcast extends Types.Subdocument {
  title: string;
  rssUrl: string;
  coverImage?: string;
  description?: string;
}

// 定义 User 文档的 TypeScript 接口，它扩展了 Mongoose 的 Document
export interface IUser extends Document {
  // _id 属性已由 Document 提供
  firebaseUid: string; // Firebase UID，用于关联Firebase认证用户（必需）
  // 移除重复字段 - 这些信息从Firebase获取
  // email: string;        // 删除 - Firebase已有
  // password?: string;    // 删除 - 使用Firebase认证
  // displayName?: string; // 删除 - Firebase已有
  
  // 只保留业务数据
  wordlist: Types.DocumentArray<IWord>;
  savedPodcasts: Types.DocumentArray<IPodcast>;
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
  };
  
  // 为实例方法也提供类型定义
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// word 子文档的 Mongoose Schema
const wordSchema = new Schema<IWord>(
  {
    word: { type: String, required: true },
    phonetic: String,
    phonetics: [Object],
    meanings: [Object],
  },
  { _id: false }
);

// podcast 子文档的 Mongoose Schema
const podcastSchema = new Schema<IPodcast>(
  {
    title: { type: String, required: true },
    rssUrl: { type: String, required: true },
    coverImage: String,
    description: String,
  },
  { _id: false }
);

// User 文档的主 Mongoose Schema
const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: [true, "Firebase UID is required"],
      unique: true,
      index: true, // 添加索引提高查询性能
    },
    // 移除重复字段 - 这些信息从Firebase获取
    // email: 删除 - Firebase已有
    // password: 删除 - 使用Firebase认证
    // displayName: 删除 - Firebase已有
    
    // 只保留业务数据
    wordlist: {
      type: [wordSchema],
      default: [],
    },
    savedPodcasts: {
      type: [podcastSchema],
      default: [],
    },
    preferences: {
      language: { type: String, default: 'en' },
      theme: { type: String, default: 'light' },
      notifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// 移除密码相关中间件和方法，因为使用Firebase认证
// 不再需要密码加密和验证逻辑

// 将 Schema 编译成 Model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;