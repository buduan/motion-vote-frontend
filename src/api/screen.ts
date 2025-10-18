import { HttpClient } from '@/utils/http';
import type { ApiResponse } from '@/types/api';
import type { ScreenStatisticsResponse, RoomInfoResponse } from '@/types/screen';

/**
 * 大屏展示API
 */
export class ScreenApi {
  /**
   * 获取大屏统计数据（实时数据）
   */
  static async getStatistics(activityId: string): Promise<ApiResponse<ScreenStatisticsResponse['data']>> {
    return HttpClient.get<ScreenStatisticsResponse['data']>(`/screen/statistics/${activityId}`);
  }

  /**
   * 获取房间连接信息
   */
  static async getRoomInfo(activityId: string): Promise<ApiResponse<RoomInfoResponse['data']>> {
    return HttpClient.get<RoomInfoResponse['data']>(`/screen/room-info/${activityId}`);
  }

  /**
   * 触发投票更新广播（管理员操作）
   */
  static async broadcastVoteUpdate(
    activityId: string,
    debateId: string,
    voteData: Record<string, unknown>,
  ): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/screen/broadcast/vote-update', {
      activity_id: activityId,
      debate_id: debateId,
      vote_data: voteData,
    });
  }

  /**
   * 触发统计数据广播（管理员操作）
   */
  static async broadcastStatistics(activityId: string): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/screen/broadcast/statistics', {
      activity_id: activityId,
    });
  }

  /**
   * 触发辩题切换广播（管理员操作）
   */
  static async broadcastDebateChange(
    activityId: string,
    debateData: Record<string, unknown>,
  ): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/screen/broadcast/debate-change', {
      activity_id: activityId,
      debate_data: debateData,
    });
  }

  /**
   * 触发辩题状态变更广播（管理员操作）
   */
  static async broadcastDebateStatus(activityId: string, debateId: string, status: string): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/screen/broadcast/debate-status', {
      activity_id: activityId,
      debate_id: debateId,
      status,
    });
  }
}
