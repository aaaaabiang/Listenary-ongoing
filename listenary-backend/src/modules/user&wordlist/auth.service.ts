// src/modules/user&wordlist/auth.service.ts
import jwt from 'jsonwebtoken';
import * as userRepository from './user.repository';
import { IUser } from './User.model';

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
    (error as any).statusCode = 409;
    throw error;
  }

  const newUser = await userRepository.createUser({ displayName, email, password });
  const token = generateToken(newUser.id);

  return {
    _id: newUser.id,
    displayName: newUser.displayName,
    email: newUser.email,
    token,
  };
};

export const login = async (loginData: Pick<IUser, 'email' | 'password'>) => {
  const { email, password } = loginData;
  const user = await userRepository.findUserByEmailWithPassword(email);

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user.id);
    return {
      _id: user.id,
      displayName: user.displayName,
      email: user.email,
      token,
    };
  } else {
    const error = new Error('邮箱或密码无效');
    (error as any).statusCode = 401;
    throw error;
  }
};


