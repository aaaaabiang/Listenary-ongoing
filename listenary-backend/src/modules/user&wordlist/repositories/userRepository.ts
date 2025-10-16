// src/modules/user/repositories/userRepository.ts
import User, { IUser } from '../models/User';

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