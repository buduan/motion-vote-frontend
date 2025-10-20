import { HttpClient } from '@/utils/http';
import type { ApiResponse, PaginatedResponse, User, UserListParams, UserUpdateRequest } from '@/types/api';

/**
 * 用户管理API
 */
export class UsersApi {
  /**
   * 获取用户列表
   * GET /api/users?page=1&limit=20&search=keyword
   * 注意：此接口直接返回分页数据，不包装在 ApiResponse 中
   */
  static async getUsers(params?: UserListParams): Promise<PaginatedResponse<User>> {
    const response = await HttpClient.get<PaginatedResponse<User>>('/users', { params });
    // 如果后端返回的是 ApiResponse 包装的数据，解包它
    if (response && 'data' in response && response.data) {
      return response.data as PaginatedResponse<User>;
    }
    // 否则直接返回（假设后端直接返回分页数据）
    return response as unknown as PaginatedResponse<User>;
  }

  /**
   * 更新用户信息
   * PUT /api/users/profile?id={userId}
   */
  static async updateUser(id: string, data: UserUpdateRequest): Promise<ApiResponse<void>> {
    return HttpClient.put<void>('/users/profile', data, { params: { id } });
  }
}
