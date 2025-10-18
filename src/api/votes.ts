import { HttpClient } from '@/utils/http';
import type { ApiResponse, VoteRequest, VoteStatus, VoteResults, Vote } from '@/types/api';

/**
 * 投票系统API
 */
export class VotesApi {
  /**
   * 提交投票
   */
  static async submitVote(data: VoteRequest): Promise<ApiResponse<Vote>> {
    return HttpClient.post<Vote>('/votes', data);
  }

  /**
   * 获取参与者投票状态
   */
  static async getVoteStatus(
    activityId: string,
    participantNumber: string,
    debateId: string,
  ): Promise<ApiResponse<VoteStatus>> {
    return HttpClient.get<VoteStatus>(`/votes/status`, {
      params: { activityId, participantNumber, debateId },
    });
  }

  /**
   * 获取辩题投票结果
   */
  static async getVoteResults(activityId: string, debateId: string): Promise<ApiResponse<VoteResults>> {
    return HttpClient.get<VoteResults>(`/activities/${activityId}/debates/${debateId}/results`);
  }

  /**
   * 获取活动所有辩题的投票结果
   */
  static async getActivityVoteResults(activityId: string): Promise<ApiResponse<VoteResults[]>> {
    return HttpClient.get<VoteResults[]>(`/activities/${activityId}/results`);
  }

  /**
   * 获取投票历史
   */
  static async getVoteHistory(activityId: string, debateId: string): Promise<ApiResponse<Vote[]>> {
    return HttpClient.get<Vote[]>(`/activities/${activityId}/debates/${debateId}/votes`);
  }
}
