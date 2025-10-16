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

  // 使用Firebase认证，但从MongoDB获取数据
  // 首先尝试通过email找到MongoDB用户
  const mongoUser = await userRepository.findUserByEmail(firebaseUser.email || '');
  
  if (!mongoUser) {
    // 如果MongoDB中没有用户，创建一个新用户
    const newUser = await createMongoUserFromFirebase(firebaseUser);
    return newUser.wordlist || [];
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

  // 使用Firebase认证，但保存到MongoDB
  // 首先尝试通过email找到MongoDB用户
  let mongoUser = await userRepository.findUserByEmail(firebaseUser.email || '');
  
  if (!mongoUser) {
    // 如果MongoDB中没有用户，创建一个新用户
    mongoUser = await createMongoUserFromFirebase(firebaseUser);
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
  
  return mongoUser.wordlist;
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

