import { HttpClient } from '@/utils/http';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  SendVerificationCodeRequest,
  SendVerificationCodeResponse,
  ForgotPasswordRequest,
  RefreshTokenResponse,
} from '@/types/api';

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
   * 发送验证码
   */
  static async sendVerificationCode(
    data: SendVerificationCodeRequest,
  ): Promise<ApiResponse<SendVerificationCodeResponse>> {
    return HttpClient.post<SendVerificationCodeResponse>('/auth/send-code', data);
  }

  /**
   * 刷新Token
   */
  static async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    return HttpClient.post<RefreshTokenResponse>('/auth/refresh', {});
  }

  /**
   * 注销Token（登出）
   */
  static async revokeToken(): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/auth/revoke', {});
  }

  /**
   * 忘记密码（重置密码）
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/auth/forgot-password', data);
  }
}
