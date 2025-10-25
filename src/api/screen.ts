import { HttpClient } from '@/utils/http';
import type { ApiResponse } from '@/types/api';
import type { ScreenStatisticsData, TimerData } from '@/types/screen';

/**
 * 大屏展示API（只保留 display 接口）
 */
export class ScreenApi {
  /**
   * 获取大屏初始化显示数据（一次性调用）
   */
  static async getDisplay(activityId: string): Promise<ApiResponse<ScreenStatisticsData>> {
    return HttpClient.get<ScreenStatisticsData>(`/screen/${activityId}/display`);
  }

  /**
   * 获取计时器配置数据（待后端实现）
   * @param activityId 活动 ID
   * @returns 计时器配置数据
   */
  static async getTimerConfig(activityId: string): Promise<ApiResponse<TimerData>> {
    return HttpClient.get<TimerData>(`/screen/${activityId}/timer`);
  }

  /**
   * 控制大屏显示
   * @param activityId 活动 ID
   * @param action 控制操作: toggle_cover_page | next_stage | previous_stage
   * @returns 操作结果
   */
  static async controlScreen(
    activityId: string,
    action: 'toggle_cover_page' | 'next_stage' | 'previous_stage',
  ): Promise<ApiResponse<{ message: string }>> {
    return HttpClient.post<{ message: string }>(`/screen/${activityId}/control`, { action });
  }
}
