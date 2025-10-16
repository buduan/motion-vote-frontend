import { HttpClient } from '@/utils/http';
import type { ApiResponse, DashboardData, ActivityReport, SiteInfo } from '@/types/api';

/**
 * 统计API
 */
export class StatisticsApi {
  /**
   * 获取仪表板数据
   */
  static async getDashboardData(activityId: string): Promise<ApiResponse<DashboardData>> {
    return HttpClient.get<DashboardData>(`/statistics/dashboard/${activityId}`);
  }

  /**
   * 获取活动报告
   */
  static async getActivityReport(activityId: string): Promise<ApiResponse<ActivityReport>> {
    return HttpClient.get<ActivityReport>(`/statistics/report/${activityId}`);
  }

  /**
   * 获取站点信息
   */
  static async getSiteInfo(): Promise<ApiResponse<SiteInfo>> {
    return HttpClient.get<SiteInfo>('/statistics/site');
  }

  /**
   * 更新站点信息
   */
  static async updateSiteInfo(data: Partial<SiteInfo>): Promise<ApiResponse<SiteInfo>> {
    return HttpClient.put<SiteInfo>('/statistics/site', data);
  }
}
