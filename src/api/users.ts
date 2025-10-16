import { HttpClient } from '@/utils/http';
import type { ApiResponse, PaginatedResponse, User, UserListParams, UserUpdateRequest } from '@/types/api';

/**
 * 用户管理API
 */
export class UsersApi {
  /**
   * 获取用户列表
   */
  static async getUsers(params?: UserListParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    return HttpClient.get<PaginatedResponse<User>>('/users', { params });
  }

  /**
   * 获取用户详情
   */
  static async getUserById(id: number): Promise<ApiResponse<User>> {
    return HttpClient.get<User>(`/users/${id}`);
  }

  /**
   * 更新用户状态
   */
  static async updateUser(id: number, data: UserUpdateRequest): Promise<ApiResponse<User>> {
    return HttpClient.patch<User>(`/users/${id}`, data);
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: number): Promise<ApiResponse<void>> {
    return HttpClient.delete<void>(`/users/${id}`);
  }
}
