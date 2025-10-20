// src/modules/user/services/userService.ts
import { IUser } from "../models/User";

// 现在直接使用MongoDB用户对象，不再需要Firebase用户类型

/**
 * 获取用户的单词本
 * @param user - MongoDB用户对象
 * @returns {Promise<Array>} - 用户的单词本数组
 */
export const getWordlistForUser = async (user: IUser): Promise<any[]> => {
  if (!user) {
    throw new Error("用户未找到");
  }

  // console.log('获取单词本 - 用户ID:', user._id);
  return user.wordlist || [];
};

/**
 * 向用户的单词本添加一个新单词
 * @param user - MongoDB用户对象
 * @param wordData - 要添加的单词数据
 * @returns {Promise<Array>} - 更新后的单词本数组
 */
export const addWordToUserWordlist = async (
  user: IUser,
  wordData: any
): Promise<any[]> => {
  if (!user) {
    throw new Error("用户未找到");
  }

  // console.log("添加单词 - 用户ID:", user._id, "单词:", wordData.word);

  // 检查单词是否已存在
  const wordExists = user.wordlist.find((item) => item.word === wordData.word);
  if (wordExists) {
    const error = new Error("这个单词已经存在于你的单词本中");
    (error as any).statusCode = 400;
    throw error;
  }

  // 添加新单词到MongoDB
  user.wordlist.push(wordData);
  await user.save();
  // console.log("单词添加成功，当前单词本数量:", user.wordlist.length);

  return user.wordlist;
};

/**
 * 从用户的单词本删除一个单词
 * @param user - MongoDB用户对象
 * @param wordText - 要删除的单词文本
 * @returns {Promise<Array>} - 更新后的单词本数组
 */
export const deleteWordFromUserWordlist = async (
  user: IUser,
  wordText: string
): Promise<any[]> => {
  if (!user) {
    throw new Error("用户未找到");
  }

  // console.log("删除单词 - 用户ID:", user._id, "单词:", wordText);

  const originalLength = user.wordlist.length;
  user.wordlist = user.wordlist.filter((item) => item.word !== wordText) as any;

  if (user.wordlist.length === originalLength) {
    const error = new Error("单词不存在于单词本中");
    (error as any).statusCode = 404;
    throw error;
  }

  await user.save();
  // console.log("单词删除成功，当前单词本数量:", user.wordlist.length);

  return user.wordlist;
};

/**
 * 获取用户收藏的播客列表
 */
export const getSavedPodcasts = async (user: IUser): Promise<any[]> => {
  if (!user) {
    throw new Error("用户未找到");
  }

  // console.log("获取收藏播客 - 用户ID:", user._id);
  return user.savedPodcasts || [];
};

/**
 * 添加播客到收藏
 */
export const addPodcastToSaved = async (
  user: IUser,
  podcastData: any
): Promise<any[]> => {
  if (!user) {
    throw new Error("用户未找到");
  }

  // console.log("添加播客到收藏 - 用户ID:", user._id, "播客:", podcastData.title);

  // 检查播客是否已存在
  const podcastExists = user.savedPodcasts.find(
    (item: any) =>
      item.title === podcastData.title || item.rssUrl === podcastData.rssUrl
  );

  if (podcastExists) {
    const error = new Error("这个播客已经在你的收藏中");
    (error as any).statusCode = 400;
    throw error;
  }

  user.savedPodcasts.push(podcastData);
  await user.save();
  // console.log("播客添加成功:", podcastData.title);

  return user.savedPodcasts;
};

/**
 * 从收藏中删除播客
 */
export const removePodcastFromSaved = async (
  user: IUser,
  podcastTitle: string
): Promise<any[]> => {
  if (!user) {
    throw new Error("用户未找到");
  }

  // console.log("从收藏删除播客 - 用户ID:", user._id, "播客:", podcastTitle);

  const originalLength = user.savedPodcasts.length;
  user.savedPodcasts = user.savedPodcasts.filter(
    (item: any) => item.title !== podcastTitle
  ) as any;

  if (user.savedPodcasts.length === originalLength) {
    const error = new Error("播客不存在于收藏中");
    (error as any).statusCode = 404;
    throw error;
  }

  await user.save();
  // console.log("播客删除成功:", podcastTitle);

  return user.savedPodcasts;
};

// 移除不再需要的createMongoUserFromFirebase函数
// 用户创建现在由统一认证中间件处理
