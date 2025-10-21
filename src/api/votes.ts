import { HttpClient } from '@/utils/http';
import type { ApiResponse, VoteRequest, VoteStatus, VoteResults, Vote, ParticipantEnterResponse } from '@/types/api';

/**
 * 投票系统API
 */
export class VotesApi {
  /**
   * 提交投票
   */
  static async submitVote(
    debateId: string,
    sessionToken: string,
    position: 'pro' | 'con' | 'abstain',
  ): Promise<ApiResponse<Vote>> {
    const voteData: VoteRequest = {
      sessionToken,
      position,
    };
    return HttpClient.post<Vote>(`/votes/debates/${debateId}`, voteData);
  }

  /**
   * 获取参与者投票状态
   */
  static async getVoteStatus(debateId: string, sessionToken: string): Promise<ApiResponse<VoteStatus>> {
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
   * 参与者入场
   */
  static async participantEnter(
    activityId: string,
    participantCode: string,
  ): Promise<ApiResponse<ParticipantEnterResponse>> {
    return HttpClient.post<ParticipantEnterResponse>('/votes/enter', {
      activity_id: activityId,
      participant_code: participantCode,
    });
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
