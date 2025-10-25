import { HttpClient } from '@/utils/http';
import type {
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
  ): Promise<PaginatedResponse<Participant>> {
    return HttpClient.getDirect<PaginatedResponse<Participant>>(`/activities/${activityId}/participants`, { params });
  }

  /**
   * 添加单个参与者
   */
  static async addParticipant(activityId: string, data: AddParticipantRequest): Promise<Participant> {
    return HttpClient.postDirect<Participant>(`/activities/${activityId}/participants`, data);
  }

  /**
   * 批量创建参与者
   */
  static async createParticipants(activityId: string, data: CreateParticipantsRequest): Promise<Participant[]> {
    return HttpClient.postDirect<Participant[]>(`/activities/${activityId}/participants/batch`, data);
  }

  /**
   * 批量导入参与者
   */
  static async batchImport(activityId: string, formData: FormData): Promise<{ success: number; failed: number }> {
    return HttpClient.postDirect<{ success: number; failed: number }>(
      `/activities/${activityId}/participants/batch`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  /**
   * 获取参与者详情
   */
  static async getParticipantById(activityId: string, participantId: string): Promise<Participant> {
    return HttpClient.getDirect<Participant>(`/activities/${activityId}/participants/${participantId}`);
  }

  /**
   * 通过参与者编号获取参与者
   */
  static async getParticipantByNumber(activityId: string, participantNumber: string): Promise<Participant> {
    return HttpClient.getDirect<Participant>(`/activities/${activityId}/participants/number/${participantNumber}`);
  }

  /**
   * 更新参与者状态
   */
  static async updateParticipantStatus(
    activityId: string,
    participantId: string,
    status: 'active' | 'inactive',
  ): Promise<Participant> {
    return HttpClient.patchDirect<Participant>(`/activities/${activityId}/participants/${participantId}`, { status });
  }

  /**
   * 删除参与者
   */
  static async deleteParticipant(activityId: string, participantId: string): Promise<void> {
    return HttpClient.deleteDirect<void>(`/activities/${activityId}/participants/${participantId}`);
  }

  /**
   * 获取参与者链接信息（通过 participantId 直接获取 activityId 和 code）
   */
  static async getParticipantLink(
    participantId: string,
  ): Promise<{ activityId: string; code: string; participantId: string }> {
    const response = await HttpClient.get<{ activityId: string; code: string; participantId: string }>(
      `/participants/${participantId}/link`,
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get participant link');
  }

  /**
   * 导出所有参与者二维码
   */
  static async exportQRCodes(activityId: string): Promise<Blob> {
    const response = await fetch(`/api/participants/qrcode?activity_id=${activityId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export QR codes');
    }

    return response.blob();
  }
}
