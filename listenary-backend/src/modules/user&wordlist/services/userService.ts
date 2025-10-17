// src/modules/user/services/userService.ts
import { IUser } from '../models/User';
import * as userRepository from '../repositories/userRepository';

// 定义Firebase用户类型
interface FirebaseUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  firebase_uid: string;
}

/**
 * 获取用户的单词本
 * @param firebaseUser - Firebase用户对象
 * @returns {Promise<Array>} - 用户的单词本数组
 */
export const getWordlistForUser = async (firebaseUser: FirebaseUser): Promise<any[]> => {
  if (!firebaseUser) {
    throw new Error('用户未找到');
  }

  console.log('获取单词本 - Firebase用户:', firebaseUser.email);

  // 使用Firebase认证，但从MongoDB获取数据
  // 首先尝试通过email找到MongoDB用户
  let mongoUser = await userRepository.findUserByEmail(firebaseUser.email || '');
  
  if (!mongoUser) {
    console.log('MongoDB中未找到用户，创建新用户...');
    // 如果MongoDB中没有用户，创建一个新用户
    mongoUser = await createMongoUserFromFirebase(firebaseUser);
  } else {
    console.log('找到MongoDB用户:', mongoUser.email);
  }
  
  return mongoUser.wordlist || [];
};

/**
 * 向用户的单词本添加一个新单词
 * @param firebaseUser - Firebase用户对象
 * @param wordData - 要添加的单词数据
 * @returns {Promise<Array>} - 更新后的单词本数组
 */
export const addWordToUserWordlist = async (firebaseUser: FirebaseUser, wordData: any): Promise<any[]> => {
  if (!firebaseUser) {
    throw new Error('用户未找到');
  }

  console.log('添加单词 - Firebase用户:', firebaseUser.email, '单词:', wordData.word);

  // 使用Firebase认证，但保存到MongoDB
  // 首先尝试通过email找到MongoDB用户
  let mongoUser = await userRepository.findUserByEmail(firebaseUser.email || '');
  
  if (!mongoUser) {
    console.log('MongoDB中未找到用户，创建新用户...');
    // 如果MongoDB中没有用户，创建一个新用户
    mongoUser = await createMongoUserFromFirebase(firebaseUser);
  } else {
    console.log('找到MongoDB用户:', mongoUser.email);
  }
  
  // 检查单词是否已存在
  const wordExists = mongoUser.wordlist.find(item => item.word === wordData.word);
  if (wordExists) {
    const error = new Error('这个单词已经存在于你的单词本中');
    (error as any).statusCode = 400;
    throw error;
  }
  
  // 添加新单词到MongoDB
  mongoUser.wordlist.push(wordData);
  await mongoUser.save();
  console.log('单词添加成功，当前单词本数量:', mongoUser.wordlist.length);
  
  return mongoUser.wordlist;
};

/**
 * 从用户的单词本删除一个单词
 * @param firebaseUser - Firebase用户对象
 * @param wordText - 要删除的单词文本
 * @returns {Promise<Array>} - 更新后的单词本数组
 */
export const deleteWordFromUserWordlist = async (firebaseUser: FirebaseUser, wordText: string): Promise<any[]> => {
  if (!firebaseUser) {
    throw new Error('用户未找到');
  }

  console.log('删除单词 - Firebase用户:', firebaseUser.email, '单词:', wordText);

  const mongoUser = await userRepository.findUserByEmail(firebaseUser.email || '');
  
  if (!mongoUser) {
    throw new Error('MongoDB中未找到用户');
  }

  const originalLength = mongoUser.wordlist.length;
  mongoUser.wordlist = mongoUser.wordlist.filter(item => item.word !== wordText) as any;
  
  if (mongoUser.wordlist.length === originalLength) {
    const error = new Error('单词不存在于单词本中');
    (error as any).statusCode = 404;
    throw error;
  }

  await mongoUser.save();
  console.log('单词删除成功，当前单词本数量:', mongoUser.wordlist.length);
  
  return mongoUser.wordlist;
};

/**
 * 获取用户收藏的播客列表
 */
export const getSavedPodcasts = async (firebaseUser: FirebaseUser): Promise<any[]> => {
  if (!firebaseUser) {
    throw new Error('用户未找到');
  }

  const mongoUser = await userRepository.findUserByEmail(firebaseUser.email || '');
  
  if (!mongoUser) {
    const newUser = await createMongoUserFromFirebase(firebaseUser);
    return newUser.savedPodcasts || [];
  }
  
  return mongoUser.savedPodcasts || [];
};

/**
 * 添加播客到收藏
 */
export const addPodcastToSaved = async (firebaseUser: FirebaseUser, podcastData: any): Promise<any[]> => {
  if (!firebaseUser) {
    throw new Error('用户未找到');
  }

  let mongoUser = await userRepository.findUserByEmail(firebaseUser.email || '');
  
  if (!mongoUser) {
    mongoUser = await createMongoUserFromFirebase(firebaseUser);
  }

  // 检查播客是否已存在
  const podcastExists = mongoUser.savedPodcasts.find(
    (item: any) => item.title === podcastData.title || item.rssUrl === podcastData.rssUrl
  );
  
  if (podcastExists) {
    const error = new Error('这个播客已经在你的收藏中');
    (error as any).statusCode = 400;
    throw error;
  }

  mongoUser.savedPodcasts.push(podcastData);
  await mongoUser.save();
  console.log('播客添加成功:', podcastData.title);
  
  return mongoUser.savedPodcasts;
};

/**
 * 从收藏中删除播客
 */
export const removePodcastFromSaved = async (firebaseUser: FirebaseUser, podcastTitle: string): Promise<any[]> => {
  if (!firebaseUser) {
    throw new Error('用户未找到');
  }

  const mongoUser = await userRepository.findUserByEmail(firebaseUser.email || '');
  
  if (!mongoUser) {
    throw new Error('MongoDB中未找到用户');
  }

  const originalLength = mongoUser.savedPodcasts.length;
  mongoUser.savedPodcasts = mongoUser.savedPodcasts.filter(
    (item: any) => item.title !== podcastTitle
  ) as any;
  
  if (mongoUser.savedPodcasts.length === originalLength) {
    const error = new Error('播客不存在于收藏中');
    (error as any).statusCode = 404;
    throw error;
  }

  await mongoUser.save();
  console.log('播客删除成功:', podcastTitle);
  
  return mongoUser.savedPodcasts;
};

/**
 * 从Firebase用户信息创建MongoDB用户
 */
async function createMongoUserFromFirebase(firebaseUser: FirebaseUser): Promise<IUser> {
  try {
    // 创建新的MongoDB用户
    const User = await import('../models/User');
    const newUser = new User.default({
      email: firebaseUser.email,
      displayName: firebaseUser.name || firebaseUser.email,
      wordlist: [],
      savedPodcasts: [],
      // 注意：MongoDB用户不需要密码，因为我们使用Firebase认证
    });
    
    await newUser.save();
    console.log(`创建新的MongoDB用户: ${firebaseUser.email}`);
    
    return newUser;
  } catch (error) {
    console.error('创建MongoDB用户失败:', error);
    throw new Error('创建用户失败');
  }
}

