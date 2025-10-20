// src/modules/user/services/firebaseUserService.ts
// 临时使用MongoDB存储用户业务数据，因为Firebase Admin SDK配置问题

import mongoose, { Schema, Document, Model } from "mongoose";

// 定义用户数据Schema
interface IUserData extends Document {
  firebaseUid: string;
  wordlist: any[];
  savedPodcasts: any[];
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
  };
}

const userDataSchema = new Schema<IUserData>({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  wordlist: { type: [Schema.Types.Mixed], default: [] } as any,
  savedPodcasts: { type: [Schema.Types.Mixed], default: [] } as any,
  preferences: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

const UserData = mongoose.model<IUserData>('UserData', userDataSchema);

/**
 * 获取用户数据（单词本、收藏播客等）
 */
export const getUserData = async (firebaseUid: string) => {
  try {
    let userData = await UserData.findOne({ firebaseUid });
    
    if (!userData) {
      // 用户不存在，创建默认数据
      userData = await UserData.create({
        firebaseUid,
        wordlist: [],
        savedPodcasts: [],
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: true
        }
      });
    }
    
    return userData.toObject();
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw new Error('获取用户数据失败');
  }
};

/**
 * 保存用户数据
 */
export const saveUserData = async (firebaseUid: string, data: any) => {
  try {
    console.log('保存用户数据:', firebaseUid, data);
    
    const userData = await UserData.findOneAndUpdate(
      { firebaseUid },
      { $set: data },
      { upsert: true, new: true }
    );
    
    console.log('用户数据保存成功');
    return userData.toObject();
  } catch (error) {
    console.error('保存用户数据失败:', error);
    throw new Error('保存用户数据失败');
  }
};

/**
 * 获取用户单词本
 */
export const getUserWordlist = async (firebaseUid: string) => {
  const userData = await getUserData(firebaseUid);
  return userData?.wordlist || [];
};

/**
 * 添加单词到用户单词本
 */
export const addWordToUserWordlist = async (firebaseUid: string, wordData: any) => {
  const userData = await getUserData(firebaseUid);
  const wordlist = userData?.wordlist || [];
  
  // 检查是否已存在
  const existingIndex = wordlist.findIndex((word: any) => word.word === wordData.word);
  
  if (existingIndex >= 0) {
    // 更新现有单词
    wordlist[existingIndex] = wordData;
  } else {
    // 添加新单词
    wordlist.push(wordData);
  }
  
  await saveUserData(firebaseUid, { wordlist });
  return wordlist;
};

/**
 * 从用户单词本删除单词
 */
export const deleteWordFromUserWordlist = async (firebaseUid: string, wordText: string) => {
  const userData = await getUserData(firebaseUid);
  const wordlist = userData?.wordlist || [];
  
  const filteredWordlist = wordlist.filter((word: any) => word.word !== wordText);
  
  await saveUserData(firebaseUid, { wordlist: filteredWordlist });
  return filteredWordlist;
};

/**
 * 获取用户收藏的播客
 */
export const getUserSavedPodcasts = async (firebaseUid: string) => {
  const userData = await getUserData(firebaseUid);
  return userData?.savedPodcasts || [];
};

/**
 * 添加播客到用户收藏
 */
export const addPodcastToUserSaved = async (firebaseUid: string, podcastData: any) => {
  const userData = await getUserData(firebaseUid);
  const savedPodcasts = userData?.savedPodcasts || [];
  
  // 检查是否已存在
  const existingIndex = savedPodcasts.findIndex((podcast: any) => podcast.title === podcastData.title);
  
  if (existingIndex >= 0) {
    // 已存在，返回现有列表
    return savedPodcasts;
  }
  
  // 添加新播客
  savedPodcasts.push(podcastData);
  
  await saveUserData(firebaseUid, { savedPodcasts });
  return savedPodcasts;
};

/**
 * 从用户收藏删除播客
 */
export const removePodcastFromUserSaved = async (firebaseUid: string, podcastTitle: string) => {
  const userData = await getUserData(firebaseUid);
  const savedPodcasts = userData?.savedPodcasts || [];
  
  const filteredPodcasts = savedPodcasts.filter((podcast: any) => podcast.title !== podcastTitle);
  
  await saveUserData(firebaseUid, { savedPodcasts: filteredPodcasts });
  return filteredPodcasts;
};
