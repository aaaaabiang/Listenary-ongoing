// src/modules/user&wordlist/User.model.ts

import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

interface IWord extends Types.Subdocument {
  word: string;
  phonetic?: string;
  phonetics?: object[];
  meanings?: object[];
}

interface IPodcast extends Types.Subdocument {
  title: string;
  rssUrl: string;
  coverImage?: string;
  description?: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  displayName?: string;
  wordlist: Types.DocumentArray<IWord>;
  savedPodcasts: Types.DocumentArray<IPodcast>;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const wordSchema = new Schema<IWord>({
  word: { type: String, required: true },
  phonetic: String,
  phonetics: [Object],
  meanings: [Object],
}, { _id: false });

const podcastSchema = new Schema<IPodcast>({
  title: { type: String, required: true },
  rssUrl: { type: String, required: true },
  coverImage: String,
  description: String,
}, { _id: false });

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, "请输入邮箱地址"],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "请输入有效的邮箱地址"],
  },
  password: {
    type: String,
    required: [true, "请输入密码"],
    minlength: 6,
    select: false,
  },
  displayName: String,
  wordlist: { type: [wordSchema], default: [] },
  savedPodcasts: { type: [podcastSchema], default: [] },
}, { timestamps: true });

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;



