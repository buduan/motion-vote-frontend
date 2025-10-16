import { HttpClient } from '@/utils/http';
import type { ApiResponse, VoteStatus, VoteResults, Vote } from '@/types/api';

/**
 * 投票系统API
 */
export class VotesApi {
  /**
   * 提交投票
   * @param debateId 辩题ID
   * @param sessionToken 会话令牌
   * @param position 投票立场：pro(正方)/con(反方)/abstain(弃权)
   */
  static async submitVote(
    debateId: string,
    sessionToken: string,
    position: 'pro' | 'con' | 'abstain'
  ): Promise<ApiResponse<Vote>> {
    return HttpClient.post<Vote>(`/votes/debates/${debateId}`, {
      sessionToken,
      position,
    });
  }

  /**
   * 获取参与者投票状态
   * 需要 sessionToken 参数
   */
  static async getVoteStatus(
    debateId: string,
    sessionToken: string,
  ): Promise<ApiResponse<VoteStatus>> {
    return HttpClient.get<VoteStatus>(`/votes/debates/${debateId}`, {
      params: { sessionToken },
    });
  }

  /**
   * 获取辩题投票结果
   */
  static async getVoteResults(debateId: string): Promise<ApiResponse<VoteResults>> {
    return HttpClient.get<VoteResults>(`/votes/debates/${debateId}/results`);
  }

  /**
   * 获取活动所有辩题的投票结果
   */
  static async getActivityVoteResults(activityId: string): Promise<ApiResponse<VoteResults[]>> {
    return HttpClient.get<VoteResults[]>(`/activities/${activityId}/results`);
  }

  /**
   * 获取投票历史、
   * 
   */
  static async getVoteHistory(activityId: string, debateId: string): Promise<ApiResponse<Vote[]>> {
    return HttpClient.get<Vote[]>(`/activities/${activityId}/debates/${debateId}/votes`);
  }
}
