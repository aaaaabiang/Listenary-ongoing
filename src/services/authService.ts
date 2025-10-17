// src/services/authService.ts
// 认证服务，管理 JWT token

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

/**
 * 保存认证 token
 */
export function saveAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 获取认证 token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 删除认证 token
 */
export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * 保存用户信息
 */
export function saveUserInfo(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * 登录
 */
export async function login(email: string, password: string) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登录失败');
  }

  const data = await response.json();
  
  // 保存 token 和用户信息
  saveAuthToken(data.token);
  saveUserInfo(data.user);
  
  return data;
}

/**
 * 注册
 */
export async function register(email: string, password: string, displayName?: string) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, displayName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '注册失败');
  }

  const data = await response.json();
  
  // 保存 token 和用户信息
  saveAuthToken(data.token);
  saveUserInfo(data.user);
  
  return data;
}

/**
 * 登出
 */
export function logout() {
  removeAuthToken();
  // 可以添加额外的清理逻辑
}

