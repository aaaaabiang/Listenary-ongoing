// src/modules/user&wordlist/user.repository.ts
import User, { IUser } from './User.model';

export const findUserByEmail = (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

export const findUserByEmailWithPassword = (email: string): Promise<IUser | null> => {
  return User.findOne({ email }).select('+password');
};

export const findUserById = (id: string): Promise<IUser | null> => {
  return User.findById(id).select('-password');
};

export const createUser = (userData: Partial<IUser>): Promise<IUser> => {
  return User.create(userData);
};

export const getWordlistByUserId = async (userId: string) => {
  const user = await User.findById(userId).select('wordlist');
  return user?.wordlist ?? [];
};

export const addWordToWordlistByUserId = async (userId: string, wordData: any) => {
  const user = await User.findById(userId).select('wordlist');
  if (!user) throw new Error('用户未找到');
  if (user.wordlist.find((w: any) => w.word === wordData.word)) {
    const error = new Error('这个单词已经存在于你的单词本中');
    (error as any).statusCode = 400;
    throw error;
  }
  user.wordlist.push(wordData as any);
  await user.save();
  return user.wordlist;
};


