// src/hooks/useAuth.ts
// 统一的认证状态管理 Hook

import { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { app } from "../firebaseApp";
import { getUserProfile, getSavedPodcasts } from "../api/userAPI";
import { model } from "../Model";
import { runInAction } from "mobx";

interface AuthState {
  user: User | null;
  userProfile: any | null;
  isLoading: boolean;
  isInitialized: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    isLoading: true,
    isInitialized: false,
  });

  // 加载用户资料
  const loadUserProfile = useCallback(async (user: User, retryCount: number = 0) => {
    try {
      const profile = await getUserProfile();
      setAuthState((prev) => ({
        ...prev,
        userProfile: profile,
        isLoading: false,
      }));

      // 更新全局模型（保持 MobX 可观察性）
      const podcasts: any[] = Array.isArray(profile?.savedPodcasts) 
        ? profile.savedPodcasts
        : (profile as any)?.savedPodcastsCount > 0 
          ? await getSavedPodcasts().catch(err => {
              console.error("Failed to fetch saved podcasts:", err);
              return [];
            })
          : [];

      model.replaceSavedPodcasts(podcasts);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      
      // 如果是网络错误且还有重试次数，延迟后重试
      if (retryCount < 2 && (error.message?.includes('Failed to fetch') || error.message?.includes('Network'))) {
        setTimeout(() => {
          loadUserProfile(user, retryCount + 1);
        }, 1000 * (retryCount + 1)); // 递增延迟：1s, 2s
        return;
      }
      
      setAuthState((prev) => ({
        ...prev,
        userProfile: null,
        isLoading: false,
      }));
    }
  }, []);

  // 登出处理
  const logout = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const auth = getAuth(app);
      await signOut(auth);

      setAuthState({
        user: null,
        userProfile: null,
        isLoading: false,
        isInitialized: true,
      });

      // 清理全局模型和所有相关状态
      runInAction(() => {
        model.replaceSavedPodcasts([]);
        model.resetTranscriptionState();
        // 清理任何缓存的用户数据
        if (model.currentUser) {
          model.currentUser = null;
        }
      });
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 初始化认证状态监听
  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthState((prev) => ({
          ...prev,
          user,
          isLoading: true,
          isInitialized: true,
        }));

        // 加载用户资料
        await loadUserProfile(user);
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    });

    return unsubscribe;
  }, [loadUserProfile]);

  return {
    ...authState,
    logout,
    isAuthenticated: !!authState.user,
  };
}
