import { HttpClient } from '@/utils/http';
import type { ApiResponse, Debate, CreateDebateRequest } from '@/types/api';

/**
 * 辩题管理API
 */
export class DebatesApi {
  /**
   * 获取活动的辩题列表
   */
  static async getDebates(activityId: string): Promise<ApiResponse<Debate[]>> {
    return HttpClient.get<Debate[]>(`/activities/${activityId}/debates`);
  }

  /**
   * 创建辩题
   */
  static async createDebate(activityId: string, data: CreateDebateRequest): Promise<ApiResponse<Debate>> {
    return HttpClient.post<Debate>(`/activities/${activityId}/debates`, data);
  }

  /**
   * 获取辩题详情
   */
  static async getDebateById(activityId: string, debateId: string): Promise<ApiResponse<Debate>> {
    return HttpClient.get<Debate>(`/activities/${activityId}/debates/${debateId}`);
  }

  /**
   * 更新辩题
   */
  static async updateDebate(
    activityId: string,
    debateId: string,
    data: Partial<CreateDebateRequest>,
  ): Promise<ApiResponse<Debate>> {
    return HttpClient.put<Debate>(`/activities/${activityId}/debates/${debateId}`, data);
  }

  /**
   * 删除辩题
   */
  static async deleteDebate(activityId: string, debateId: string): Promise<ApiResponse<void>> {
    return HttpClient.delete<void>(`/activities/${activityId}/debates/${debateId}`);
  }

  /**
   * 更新辩题状态
   */
  static async updateDebateStatus(
    activityId: string,
    debateId: string,
    status: 'pending' | 'active' | 'ended',
  ): Promise<ApiResponse<Debate>> {
    return HttpClient.patch<Debate>(`/activities/${activityId}/debates/${debateId}/status`, { status });
  }
}
