import { HttpClient } from '@/utils/http';
import type { ApiResponse, ScreenData, ScreenConfig } from '@/types/api';

/**
 * 大屏展示API
 */
export class ScreenApi {
  /**
   * 获取大屏展示数据
   */
  static async getScreenData(activityId: string): Promise<ApiResponse<ScreenData>> {
    return HttpClient.get<ScreenData>(`/screen/${activityId}`);
  }

  /**
   * 更新大屏配置
   */
  static async updateScreenConfig(
    activityId: string,
    config: Partial<ScreenConfig>,
  ): Promise<ApiResponse<ScreenConfig>> {
    return HttpClient.put<ScreenConfig>(`/screen/${activityId}/config`, config);
  }
}
