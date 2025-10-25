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

// 完整的投票统计数据（匹配后端VoteStats）
export interface VoteStats {
  debateId: string;
  totalVotes: number;
  proVotes: number;
  proPreviousVotes: number;
  proToConVotes: number;
  conVotes: number;
  conPreviousVotes: number;
  conToProVotes: number;
  abstainVotes: number;
  abstainPreviousVotes: number;
  abstainToProVotes: number;
  abstainToConVotes: number;
  proScore: number;
  conScore: number;
  abstainPercentage: number;
  winner: string | null;
  isLocked: boolean;
  lockedAt: string | null;
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
  voteStats: VoteStats | null;
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

// Timer related types
export interface BellTiming {
  time: number; // 在第几秒播放铃声
  type: 'start' | 'warning' | 'end'; // 铃声类型
}

export interface TimerSide {
  name: string; // 发言者名称
  duration: number; // 时长（秒）
  currentTime?: number; // 当前时间（秒）
  isRunning?: boolean; // 是否正在计时
}

export interface TimerStage {
  stageName: string; // 阶段名称，例如 "立论阶段"、"质询阶段"
  isDualSide: boolean; // 是否为双方计时器
  sides: TimerSide[]; // 计时器侧面（1个或2个）
  bellTimings: BellTiming[]; // 铃声时机配置
  hideTimer?: boolean; // 是否隐藏计时器（只显示发言者名称）
}

export interface TimerData {
  activityName: string; // 活动名称
  debateTitle: string; // 辩题
  stages: TimerStage[]; // 多个计时器阶段
  timestamp?: string;
}

export interface TimerResponse {
  success: boolean;
  data: TimerData;
  message: string;
}
