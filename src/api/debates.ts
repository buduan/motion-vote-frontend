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
  static async getDebateById(debateId: string): Promise<ApiResponse<Debate>> {
    return HttpClient.get<Debate>(`/debates/${debateId}`);
  }

  /**
   * 更新辩题
   */
  static async updateDebate(debateId: string, data: Partial<CreateDebateRequest>): Promise<ApiResponse<Debate>> {
    return HttpClient.put<Debate>(`/debates/${debateId}`, data);
  }

  /**
   * 删除辩题
   */
  static async deleteDebate(debateId: string): Promise<ApiResponse<void>> {
    return HttpClient.delete<void>(`/debates/${debateId}`);
  }

  /**
   * 更新辩题状态
   */
  static async updateDebateStatus(
    debateId: string,
    status: 'pending' | 'ongoing' | 'final_vote' | 'ended',
  ): Promise<ApiResponse<Debate>> {
    return HttpClient.put<Debate>(`/debates/${debateId}/status`, { status });
  }

  /**
   * 切换当前辩题
   */
  static async switchCurrentDebate(activityId: string, debateId: string): Promise<ApiResponse<void>> {
    return HttpClient.put<void>(`/activities/${activityId}/current-debate`, { debateId });
  }
}
