/**
 * Screen Display Types
 * 大屏展示相关的类型定义
 *
 * 注意：类型定义使用 camelCase 以匹配后端 API 返回格式
 */

// 辩题数据
export interface DebateData {
  id: string;
  title: string;
  description?: string;
  status: string;
  order: number;
}

// 当前辩题统计（投票数据）
export interface CurrentDebateStats {
  debateId: string;
  proVotes: number;
  conVotes: number;
  abstainVotes: number;
  totalVotes: number;
  proPercentage: number;
  conPercentage: number;
  abstainPercentage: number;
}

// 实时统计数据
export interface RealTimeStats {
  totalParticipants: number;
  checkedInParticipants: number;
  onlineParticipants: number;
  totalVotes: number;
  voteRate: number;
}

// 大屏统计数据（完整格式）
export interface ScreenStatisticsData {
  activityId: string;
  activityName: string;
  activityStatus: string;
  currentDebate: DebateData | null;
  currentDebateStats: CurrentDebateStats | null;
  realTimeStats: RealTimeStats;
  timestamp: string;
}

// 大屏统计数据（WebSocket 消息格式）
export interface ScreenStatistics {
  type: 'statistics_update';
  activity_id: string;
  data: ScreenStatisticsData;
  timestamp: string;
}

// 投票更新数据（已整合到 statistics_update 中，保留作为兼容类型）
export interface VoteUpdate {
  type: 'vote_update';
  activity_id: string;
  debate_id: string;
  data: {
    proVotes: number;
    conVotes: number;
    abstainVotes: number;
    totalVotes: number;
    proPercentage: number;
    conPercentage: number;
    abstainPercentage: number;
    latest_vote?: {
      side: 'pro' | 'con' | 'abstain';
      participant_name?: string;
      timestamp: string;
    };
  };
  timestamp: string;
}

// 辩题切换数据
export interface DebateChange {
  type: 'debate_change';
  activity_id: string;
  data: DebateData;
  timestamp: string;
}

// 辩题状态变更
export interface DebateStatus {
  type: 'debate_status';
  activity_id: string;
  debate_id: string;
  status: string;
  timestamp: string;
}

// API 响应类型（REST API 返回格式）
export interface ScreenStatisticsResponse {
  success: boolean;
  data: ScreenStatisticsData;
  message: string;
}

export interface RoomInfoResponse {
  success: boolean;
  data: {
    activity_id: string;
    connections: number;
    users: unknown[];
  };
  message: string;
}
