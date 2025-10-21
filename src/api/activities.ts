import { HttpClient } from '@/utils/http';
import type {
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
  static async getActivities(params?: ActivityListParams): Promise<PaginatedResponse<Activity>> {
    return HttpClient.get<PaginatedResponse<Activity>>('/activities', { params }) as any;
  }

  /**
   * 创建活动
   */
  static async createActivity(data: CreateActivityRequest): Promise<Activity> {
    return HttpClient.postDirect<Activity>('/activities', data);
  }

  /**
   * 获取活动详情
   */
  static async getActivityById(id: string): Promise<ActivityDetail> {
    return HttpClient.getDirect<ActivityDetail>(`/activities/${id}`);
  }

  /**
   * 更新活动
   */
  static async updateActivity(id: string, data: Partial<CreateActivityRequest>): Promise<Activity> {
    return HttpClient.putDirect<Activity>(`/activities/${id}`, data);
  }

  /**
   * 删除活动
   */
  static async deleteActivity(id: string): Promise<void> {
    return HttpClient.deleteDirect<void>(`/activities/${id}`);
  }

  /**
   * 邀请协作者
   */
  static async inviteCollaborator(
    activityId: string,
    data: InviteCollaboratorRequest,
  ): Promise<Collaborator> {
    return HttpClient.postDirect<Collaborator>(`/activities/${activityId}/collaborators`, data);
  }

  /**
   * 获取协作者列表
   */
  static async getCollaborators(activityId: string): Promise<Collaborator[]> {
    return HttpClient.getDirect<Collaborator[]>(`/activities/${activityId}/collaborators`);
  }

  /**
   * 更新协作者权限
   */
  static async updateCollaboratorPermissions(
    activityId: string,
    collaboratorId: string,
    permissions: ('view' | 'edit' | 'control')[],
  ): Promise<void> {
    return HttpClient.putDirect<void>(`/activities/${activityId}/collaborators/${collaboratorId}`, {
      permissions,
    });
  }

  /**
   * 删除协作者
   */
  static async removeCollaborator(activityId: string, collaboratorId: string): Promise<void> {
    return HttpClient.deleteDirect<void>(`/activities/${activityId}/collaborators/${collaboratorId}`);
  }
}
