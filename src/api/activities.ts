import { HttpClient } from '@/utils/http';
import type {
  ApiResponse,
  PaginatedResponse,
  Activity,
  ActivityDetail,
  ActivityListParams,
  CreateActivityRequest,
  InviteCollaboratorRequest,
  Collaborator,
} from '@/types/api';

/**
 * 活动管理API
 */
export class ActivitiesApi {
  /**
   * 获取活动列表
   */
  static async getActivities(params?: ActivityListParams): Promise<ApiResponse<PaginatedResponse<Activity>>> {
    return HttpClient.get<PaginatedResponse<Activity>>('/activities', { params });
  }

  /**
   * 创建活动
   */
  static async createActivity(data: CreateActivityRequest): Promise<ApiResponse<Activity>> {
    return HttpClient.post<Activity>('/activities', data);
  }

  /**
   * 获取活动详情
   */
  static async getActivityById(id: string): Promise<ApiResponse<ActivityDetail>> {
    return HttpClient.get<ActivityDetail>(`/activities/${id}`);
  }

  /**
   * 更新活动
   */
  static async updateActivity(id: string, data: Partial<CreateActivityRequest>): Promise<ApiResponse<Activity>> {
    return HttpClient.put<Activity>(`/activities/${id}`, data);
  }

  /**
   * 删除活动
   */
  static async deleteActivity(id: string): Promise<ApiResponse<void>> {
    return HttpClient.delete<void>(`/activities/${id}`);
  }

  /**
   * 邀请协作者
   */
  static async inviteCollaborator(
    activityId: string,
    data: InviteCollaboratorRequest,
  ): Promise<ApiResponse<Collaborator>> {
    return HttpClient.post<Collaborator>(`/activities/${activityId}/collaborators`, data);
  }

  /**
   * 获取协作者列表
   */
  static async getCollaborators(activityId: string): Promise<ApiResponse<Collaborator[]>> {
    return HttpClient.get<Collaborator[]>(`/activities/${activityId}/collaborators`);
  }

  /**
   * 删除协作者
   */
  static async removeCollaborator(activityId: string, collaboratorId: string): Promise<ApiResponse<void>> {
    return HttpClient.delete<void>(`/activities/${activityId}/collaborators/${collaboratorId}`);
  }
}
