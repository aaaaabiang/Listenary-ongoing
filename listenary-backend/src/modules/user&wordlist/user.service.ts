// src/modules/user&wordlist/user.service.ts
import { IUser } from './User.model';
import * as userRepository from './user.repository';

export const getWordlistForUser = (user: IUser) => {
  if (!user) {
    throw new Error('用户未找到');
  }
  return user.wordlist;
};

export const getWordlistByUserId = async (userId: string) => {
  return userRepository.getWordlistByUserId(userId);
};

export const addWordToUserWordlist = async (user: IUser, wordData: any) => {
  if (!user) {
    throw new Error('用户未找到');
  }
  return userRepository.addWordToWordlistByUserId(user.id, wordData);
};


