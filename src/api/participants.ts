import { HttpClient } from '@/utils/http';
import type {
  ApiResponse,
  PaginatedResponse,
  Participant,
  ParticipantListParams,
  CreateParticipantsRequest,
  AddParticipantRequest,
} from '@/types/api';

/**
 * 参与者管理API
 */
export class ParticipantsApi {
  /**
   * 获取参与者列表
   */
  static async getParticipants(
    activityId: string,
    params?: ParticipantListParams,
  ): Promise<ApiResponse<PaginatedResponse<Participant>>> {
    return HttpClient.get<PaginatedResponse<Participant>>(`/activities/${activityId}/participants`, { params });
  }

  /**
   * 添加单个参与者
   */
  static async addParticipant(activityId: string, data: AddParticipantRequest): Promise<ApiResponse<Participant>> {
    return HttpClient.post<Participant>(`/activities/${activityId}/participants`, data);
  }

  /**
   * 批量创建参与者
   */
  static async createParticipants(
    activityId: string,
    data: CreateParticipantsRequest,
  ): Promise<ApiResponse<Participant[]>> {
    return HttpClient.post<Participant[]>(`/activities/${activityId}/participants/batch`, data);
  }

  /**
   * 批量导入参与者
   */
  static async batchImport(activityId: string, formData: FormData): Promise<ApiResponse<any>> {
    return HttpClient.post<any>(`/activities/${activityId}/participants/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 获取参与者详情
   */
  static async getParticipantById(activityId: string, participantId: string): Promise<ApiResponse<Participant>> {
    return HttpClient.get<Participant>(`/activities/${activityId}/participants/${participantId}`);
  }

  /**
   * 通过参与者编号获取参与者
   */
  static async getParticipantByNumber(
    activityId: string,
    participantNumber: string,
  ): Promise<ApiResponse<Participant>> {
    return HttpClient.get<Participant>(`/activities/${activityId}/participants/number/${participantNumber}`);
  }

  /**
   * 更新参与者状态
   */
  static async updateParticipantStatus(
    activityId: string,
    participantId: string,
    status: 'active' | 'inactive',
  ): Promise<ApiResponse<Participant>> {
    return HttpClient.patch<Participant>(`/activities/${activityId}/participants/${participantId}`, { status });
  }

  /**
   * 删除参与者
   */
  static async deleteParticipant(activityId: string, participantId: string): Promise<ApiResponse<void>> {
    return HttpClient.delete<void>(`/activities/${activityId}/participants/${participantId}`);
  }
}
