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
  firebaseUid?: string; // Firebase UID，用于Firebase认证用户
  email: string;
  password?: string; // 改为可选，支持Firebase认证用户
  displayName?: string;
  wordlist: Types.DocumentArray<IWord>;
  savedPodcasts: Types.DocumentArray<IPodcast>;
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
      unique: true,
      sparse: true, // 允许null值，但如果有值则必须唯一
    },
    email: {
      type: String,
      required: [true, "请输入邮箱地址"],
      unique: true,
      lowercase: true,
      match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "请输入有效的邮箱地址" ],
    },
    password: {
      type: String,
      required: false, // 改为可选，支持Firebase认证用户
      minlength: 6,
      select: false,
    },
    displayName: String,
    wordlist: {
      type: [wordSchema],
      default: [],
    },
    savedPodcasts: {
      type: [podcastSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose pre-save 中间件，用于自动加密密码
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Mongoose 实例方法，用于安全地比较密码
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  // 如果是Firebase用户（没有密码），返回false
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// 将 Schema 编译成 Model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;