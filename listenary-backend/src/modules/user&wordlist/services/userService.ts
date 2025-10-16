// src/modules/user/services/userService.ts
import { IUser } from '../models/User';

/**
 * 获取用户的单词本
 * @param user - 完整的用户文档对象
 * @returns {Array} - 用户的单词本数组
 */
export const getWordlistForUser = (user: IUser) => {
  if (!user) {
    throw new Error('用户未找到');
  }
  return user.wordlist;
};

/**
 * 向用户的单词本添加一个新单词
 * @param user - 完整的用户文档对象
 * @param wordData - 要添加的单词数据
 * @returns {Promise<Array>} - 更新后的单词本数组
 */
export const addWordToUserWordlist = async (user: IUser, wordData: any) => {
  if (!user) {
    throw new Error('用户未找到');
  }

  const wordExists = user.wordlist.find(item => item.word === wordData.word);
  if (wordExists) {
    const error = new Error('这个单词已经存在于你的单词本中');
    (error as any).statusCode = 400;
    throw error;
  }

  user.wordlist.push(wordData);
  await user.save();
  return user.wordlist;
};

