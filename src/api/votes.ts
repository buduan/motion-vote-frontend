import { HttpClient } from '@/utils/http';
import type { ApiResponse, VoteRequest, VoteStatus, VoteStats, Vote, ParticipantEnterResponse, VoteResponse } from '@/types/api';

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
  ): Promise<ApiResponse<VoteResponse>> {
    const voteData: VoteRequest = {
      sessionToken,
      position,
    };
    return HttpClient.post<VoteResponse>(`/votes/debates/${debateId}`, voteData);
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
  static async getVoteStats(debateId: string): Promise<ApiResponse<VoteStats>> {
    return HttpClient.get<VoteStats>(`/votes/debates/${debateId}/results`);
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
   * 参与者通过 ID 直接入场（推荐方式）
   */
  static async participantEnterById(
    participantId: string,
    deviceFingerprint?: string,
  ): Promise<ApiResponse<ParticipantEnterResponse>> {
    const requestData = {
      participant_id: participantId,
      device_fingerprint: deviceFingerprint,
    };
    console.log('[VotesApi.participantEnterById] 发送请求:');
    console.log('  - URL: /votes/enter');
    console.log('  - 请求数据:', requestData);
    
    const result = await HttpClient.post<ParticipantEnterResponse>('/votes/enter', requestData);
    
    console.log('[VotesApi.participantEnterById] 收到响应:');
    console.log('  - 完整响应:', result);
    
    return result;
  }

  /**
   * 获取活动所有辩题的投票结果
   */
  static async getActivityVoteStats(activityId: string): Promise<ApiResponse<VoteStats[]>> {
    return HttpClient.get<VoteStats[]>(`/activities/${activityId}/results`);
  }

  /**
   * 获取投票历史
   */
  static async getVoteHistory(activityId: string, debateId: string): Promise<ApiResponse<Vote[]>> {
    return HttpClient.get<Vote[]>(`/activities/${activityId}/debates/${debateId}/votes`);
  }
}
