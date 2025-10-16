import { HttpClient } from '@/utils/http';
import type { ApiResponse, User } from '@/types/api';

/**
 * 用户相关API
 */
export class UserApi {
  /**
   * 获取当前用户信息
   */
  static async getProfile(): Promise<User> {
    // Note: This endpoint returns User directly, not wrapped in ApiResponse
    const response = await HttpClient.get<User>('/users/profile');
    return response as unknown as User;
  }

  /**
   * 更新用户信息
   */
  static async updateProfile(data: Partial<User>): Promise<ApiResponse<void>> {
    return HttpClient.put<void>('/users/profile', data);
  }
}
