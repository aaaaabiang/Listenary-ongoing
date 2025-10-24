// src/config/apiConfig.ts
// 统一的API配置

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export { API_BASE_URL };

// 获取认证token的通用函数
export async function getAuthToken(forceRefresh: boolean = false): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken(forceRefresh);
}

// 通用的API请求函数
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, config);
}

// 带认证的API请求函数（带重试机制）
export async function authenticatedApiRequest(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<Response> {
  try {
    const token = await getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    };

    const response = await apiRequest(endpoint, config);
    
    // 如果token过期，尝试刷新token并重试一次
    if (response.status === 401 && retryCount === 0) {
      const refreshedToken = await getAuthToken(true); // 强制刷新token
      const retryConfig: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${refreshedToken}`,
        },
      };
      return apiRequest(endpoint, retryConfig);
    }
    
    return response;
  } catch (error) {
    // 如果是认证错误且还有重试次数，尝试刷新token
    if (error.message?.includes('User not authenticated') && retryCount === 0) {
      try {
        const refreshedToken = await getAuthToken(true);
        const retryConfig: RequestInit = {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${refreshedToken}`,
          },
        };
        return apiRequest(endpoint, retryConfig);
      } catch (retryError) {
        throw error; // 重试失败，抛出原始错误
      }
    }
    throw error;
  }
}
