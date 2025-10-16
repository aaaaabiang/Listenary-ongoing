// src/modules/user&wordlist/services/authService.ts
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository';
import { IUser } from '../models/User';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export const register = async (userData: Pick<IUser, 'displayName' | 'email' | 'password'>) => {
  const { email, password, displayName } = userData;

  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    const error = new Error('此邮箱已被注册');
    (error as any).statusCode = 409; // 附加状态码, 方便 Controller 使用
    throw error;
  }

  const newUser = await userRepository.createUser({ displayName, email, password });
  
  // --- FIX ---
  // 使用 newUser.id (string) 代替 newUser._id.toString()
  const token = generateToken(newUser.id);

  return {
    _id: newUser.id, // 也在这里使用 .id
    displayName: newUser.displayName,
    email: newUser.email,
    token,
  };
};

// I've added a possible implementation for loginUser, fixing the same error.
export const login = async (loginData: Pick<IUser, 'email' | 'password'>) => {
  const { email, password } = loginData;

  const user = await userRepository.findUserByEmailWithPassword(email);

  if (user && (await user.matchPassword(password))) {
    // --- FIX ---
    // 使用 user.id (string) 代替 user._id.toString()
    const token = generateToken(user.id);

    return {
      _id: user.id, // 也在这里使用 .id
      displayName: user.displayName,
      email: user.email,
      token,
    };
  } else {
    const error = new Error('邮箱或密码无效');
    (error as any).statusCode = 401; // Unauthorized
    throw error;
  }
};