import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthApi } from '@/api/auth';
import { UserApi } from '@/api/user';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';
import toast from '@/utils/toast';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5分钟

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const tokenExpiry = ref<number | null>(
    localStorage.getItem(TOKEN_EXPIRY_KEY) ? Number(localStorage.getItem(TOKEN_EXPIRY_KEY)) : null,
  );
  const isLoading = ref(false);
  const refreshTimer = ref<ReturnType<typeof setTimeout> | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isOrganizer = computed(() => user.value?.role === 'organizer');

  // 检查token是否即将过期
  const isTokenExpiringSoon = computed(() => {
    if (!tokenExpiry.value) return false;
    const timeLeft = tokenExpiry.value - Date.now();
    return timeLeft > 0 && timeLeft < REFRESH_THRESHOLD;
  });

  // 设置token
  const setToken = (newToken: string, expiresIn: number = 3600) => {
    token.value = newToken;
    const expiry = Date.now() + expiresIn * 1000;
    tokenExpiry.value = expiry;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  };

  // 清除token
  const clearToken = () => {
    token.value = null;
    tokenExpiry.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    if (refreshTimer.value) {
      clearTimeout(refreshTimer.value);
      refreshTimer.value = null;
    }
  };

  // 设置用户信息
  const setUser = (userData: User) => {
    user.value = userData;
  };

  // 清除用户信息
  const clearUser = () => {
    user.value = null;
  };

  // 登录
  const login = async (credentials: LoginRequest) => {
    isLoading.value = true;
    try {
      const response = await AuthApi.login(credentials);
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        scheduleTokenRefresh();
        return { success: true };
      }
      return { success: false, message: response.message || '登录失败' };
    } catch (error: unknown) {
      // 从错误响应中提取消息
      let message = '登录失败';

      // 检查是否是 401 错误（密码错误）
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          message = '邮箱或密码错误，请检查后重试';
        } else if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = (error as { message: string }).message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      return { success: false, message };
    } finally {
      isLoading.value = false;
    }
  };

  // 注册
  const register = async (data: RegisterRequest) => {
    isLoading.value = true;
    try {
      const response = await AuthApi.register(data);
      if (response.success && response.data) {
        return { success: true, message: '注册成功，请登录' };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '注册失败';
      return { success: false, message: message || '注册失败' };
    } finally {
      isLoading.value = false;
    }
  };

  // 刷新token
  const refreshToken = async () => {
    try {
      const response = await AuthApi.refreshToken();
      if (response.success && response.data) {
        setToken(response.data.token);
        scheduleTokenRefresh();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      // 刷新失败，清除认证信息
      await logout();
      return { success: false, error: error };
    }
  };

  // 安排token刷新
  const scheduleTokenRefresh = () => {
    if (refreshTimer.value) {
      clearTimeout(refreshTimer.value);
    }

    if (!tokenExpiry.value) return;

    const timeLeft = tokenExpiry.value - Date.now();
    const refreshTime = timeLeft - REFRESH_THRESHOLD;

    if (refreshTime > 0) {
      refreshTimer.value = setTimeout(async () => {
        await refreshToken();
      }, refreshTime);
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 尝试注销服务器端的token
      if (token.value) {
        await AuthApi.revokeToken();
      }
    } catch (error) {
      // 即使服务器端注销失败，也要清除本地状态
      // console.error('Token revoke failed:', error);
      toast.error('退出登录时发生错误: ' + (error instanceof Error ? error.message : 'unknown error'));
    } finally {
      clearToken();
      clearUser();
    }
  };

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      const user = await UserApi.getProfile();
      if (user) {
        setUser(user);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      // 获取用户信息失败，可能token已失效
      await logout();
      return { success: false, error };
    }
  };

  // 初始化 - 从localStorage恢复认证状态
  const init = async () => {
    if (token.value) {
      // 如果有token，获取用户信息
      const result = await fetchUserProfile();
      if (result.success) {
        scheduleTokenRefresh();
      }
    }
  };

  return {
    // State
    user,
    token,
    isLoading,

    // Computed
    isAuthenticated,
    isAdmin,
    isOrganizer,
    isTokenExpiringSoon,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    fetchUserProfile,
    init,
  };
});
