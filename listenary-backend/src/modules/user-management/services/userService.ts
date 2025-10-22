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
    throw new Error("User not found");
  }

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
): Promise<{ wordlist: any[], isDuplicate: boolean }> => {
  if (!user) {
    throw new Error("User not found");
  }

  // 检查单词是否已存在
  const wordExists = user.wordlist.find((item) => item.word === wordData.word);
  if (wordExists) {
    // 返回成功状态，但标记为重复
    return {
      wordlist: user.wordlist,
      isDuplicate: true
    };
  }

  // 添加新单词到MongoDB
  user.wordlist.push(wordData);
  await user.save();

  return {
    wordlist: user.wordlist,
    isDuplicate: false
  };
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
    throw new Error("User not found");
  }


  const originalLength = user.wordlist.length;
  user.wordlist = user.wordlist.filter((item) => item.word !== wordText) as any;

  if (user.wordlist.length === originalLength) {
    const error = new Error("Word not found in wordlist");
    (error as any).statusCode = 404;
    throw error;
  }

  await user.save();

  return user.wordlist;
};

/**
 * 获取用户收藏的播客列表
 */
export const getSavedPodcasts = async (user: IUser): Promise<any[]> => {
  if (!user) {
    throw new Error("User not found");
  }

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
    throw new Error("User not found");
  }


  // 检查播客是否已存在
  const podcastExists = user.savedPodcasts.find(
    (item: any) =>
      item.title === podcastData.title || item.rssUrl === podcastData.rssUrl
  );

  if (podcastExists) {
    const error = new Error("This podcast is already in your favorites");
    (error as any).statusCode = 400;
    throw error;
  }

  user.savedPodcasts.push(podcastData);
  await user.save();

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
    throw new Error("User not found");
  }


  const originalLength = user.savedPodcasts.length;
  user.savedPodcasts = user.savedPodcasts.filter(
    (item: any) => item.title !== podcastTitle
  ) as any;

  if (user.savedPodcasts.length === originalLength) {
    const error = new Error("Podcast not found in favorites");
    (error as any).statusCode = 404;
    throw error;
  }

  await user.save();

  return user.savedPodcasts;
};

// 移除不再需要的createMongoUserFromFirebase函数
// 用户创建现在由统一认证中间件处理
