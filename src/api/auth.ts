import { HttpClient } from '@/utils/http';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/api';

/**
 * 认证相关API
 */
export class AuthApi {
  /**
   * 用户登录
   */
  static async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return HttpClient.post<LoginResponse>('/auth/login', data);
  }

  /**
   * 用户注册
   */
  static async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return HttpClient.post<User>('/auth/register', data);
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return HttpClient.get<User>('/auth/me');
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/auth/logout');
  }

  /**
   * 刷新token
   */
  static async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return HttpClient.post<LoginResponse>('/auth/refresh');
  }
}
