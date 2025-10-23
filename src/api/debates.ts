import { HttpClient } from '@/utils/http';
import type { ApiResponse, PaginatedResponse, Debate, CreateDebateRequest, DebateStage } from '@/types/api';

/**
 * 辩题管理API
 */
export class DebatesApi {
  /**
   * 获取活动的辩题列表
   */
  static async getDebates(activityId: string): Promise<ApiResponse<PaginatedResponse<Debate>>> {
    return HttpClient.getDirect<ApiResponse<PaginatedResponse<Debate>>>(`/activities/${activityId}/debates`);
  }

  /**
   * 创建辩题
   */
  static async createDebate(activityId: string, data: CreateDebateRequest): Promise<ApiResponse<Debate>> {
    return HttpClient.postDirect<ApiResponse<Debate>>(`/activities/${activityId}/debates`, data);
  }

  /**
   * 获取辩题详情
   */
  static async getDebateById(debateId: string): Promise<ApiResponse<Debate>> {
    return HttpClient.getDirect<ApiResponse<Debate>>(`/debates/${debateId}`);
  }

  /**
   * 更新辩题
   */
  static async updateDebate(debateId: string, data: Partial<CreateDebateRequest>): Promise<ApiResponse<Debate>> {
    return HttpClient.putDirect<ApiResponse<Debate>>(`/debates/${debateId}`, data);
  }

  /**
   * 删除辩题
   */
  static async deleteDebate(debateId: string): Promise<ApiResponse<void>> {
    return HttpClient.deleteDirect<ApiResponse<void>>(`/debates/${debateId}`);
  }

  /**
   * 更新辩题状态
   */
  static async updateDebateStatus(
    debateId: string,
    status: 'pending' | 'ongoing' | 'final_vote' | 'ended',
  ): Promise<ApiResponse<Debate>> {
    return HttpClient.putDirect<ApiResponse<Debate>>(`/debates/${debateId}/status`, { status });
  }

  /**
   * 切换当前辩题
   */
  static async switchCurrentDebate(activityId: string, debateId: string): Promise<ApiResponse<void>> {
    return HttpClient.putDirect<ApiResponse<void>>(`/activities/${activityId}/current-debate`, { debateId });
  }

  /**
   * 更新辩题阶段配置（计时器配置）
   */
  static async updateDebateStages(debateId: string, stages: DebateStage[]): Promise<ApiResponse<void>> {
    return HttpClient.putDirect<ApiResponse<void>>(`/debates/${debateId}/stages`, stages);
  }
}
