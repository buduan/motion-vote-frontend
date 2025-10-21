import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthApi } from '@/api/auth';
import { UserApi } from '@/api/user';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';
import toast from '@/utils/toast';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

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

  // Check if token is expiring soon
  const isTokenExpiringSoon = computed(() => {
    if (!tokenExpiry.value) return false;
    const timeLeft = tokenExpiry.value - Date.now();
    return timeLeft > 0 && timeLeft < REFRESH_THRESHOLD;
  });

  // Set token
  const setToken = (newToken: string, expiresIn: number = 3600) => {
    token.value = newToken;
    const expiry = Date.now() + expiresIn * 1000;
    tokenExpiry.value = expiry;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  };

  // Clear token
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

  // Set user info
  const setUser = (userData: User) => {
    user.value = userData;
  };

  // Clear user info
  const clearUser = () => {
    user.value = null;
  };

  // Login
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
      return { success: false, message: response.message || 'Login failed' };
    } catch (error: unknown) {
      // Extract message from error response
      let message = 'Login failed';

      // Check if it's a 401 error (password error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          message = 'Invalid email or password, please try again';
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

  // Register
  const register = async (data: RegisterRequest) => {
    isLoading.value = true;
    try {
      const response = await AuthApi.register(data);
      if (response.success && response.data) {
        return { success: true, message: 'Registration successful, please login' };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, message: message || 'Registration failed' };
    } finally {
      isLoading.value = false;
    }
  };

  // Refresh token
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
      // Refresh failed, clear authentication info
      await logout();
      return { success: false, error: error };
    }
  };

  // Schedule token refresh
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

  // Logout
  const logout = async () => {
    try {
      // Try to revoke token on server side
      if (token.value) {
        await AuthApi.revokeToken();
      }
    } catch (error) {
      // Clear local state even if server side logout fails
      // console.error('Token revoke failed:', error);
      toast.error('Error during logout: ' + (error instanceof Error ? error.message : 'unknown error'));
    } finally {
      clearToken();
      clearUser();
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const user = await UserApi.getProfile();
      if (user) {
        setUser(user);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      // Failed to fetch user info, token might be invalid
      await logout();
      return { success: false, error };
    }
  };

  // Initialize - restore authentication state from localStorage
  const init = async () => {
    if (token.value) {
      // If token exists, fetch user info
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
