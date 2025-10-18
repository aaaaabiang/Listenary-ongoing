// src/types/express/index.d.ts

// 从您的 User 模型中导入 IUser 接口
import { IUser } from '../../modules/user&wordlist/models/User';

// 使用 declare global 来扩展全局模块
declare global {
  // 扩展 Express 的命名空间
  namespace Express {
    // 扩展 Request 接口
    interface Request {
      // 添加 user 属性，它的类型是 IUser 或者可能为 null
      // 定义为可选（?）是因为并非所有请求都经过 authMiddleware
      user?: IUser | null;
      
      // 添加 firebaseUser 属性，用于存储Firebase用户信息
      firebaseUser?: {
        uid: string;
        email?: string;
        displayName?: string;
        photoURL?: string;
        email_verified?: boolean;
      };
    }
  }
}