import { HttpClient } from '@/utils/http';
import type { ApiResponse } from '@/types/api';
import type { ScreenStatisticsData } from '@/types/screen';

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
}
