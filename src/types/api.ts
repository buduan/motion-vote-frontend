// API 响应基础类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  timestamp: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  timestamp: string;
  error?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'organizer';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  code: string;
  session: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SendVerificationCodeRequest {
  email: string;
}

export interface SendVerificationCodeResponse {
  session: string;
}

export interface ForgotPasswordRequest {
  email: string;
  code: string;
  session: string;
  newPassword: string;
}

export interface RefreshTokenResponse {
  token: string;
}

// 活动相关类型
export interface Activity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  maxParticipants?: number;
  currentParticipants: number;
  ownerId: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityDetail extends Activity {
  debates: Debate[];
  collaborators: Collaborator[];
  participants: Participant[];
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number;
}

// 辩题相关类型
export interface Debate {
  id: string;
  title: string;
  proDescription: string;
  conDescription: string;
  background?: string;
  estimatedDuration?: number;
  order: number;
  status: 'pending' | 'active' | 'ended';
  activityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebateRequest {
  title: string;
  proDescription: string;
  conDescription: string;
  background?: string;
  estimatedDuration?: number;
  order?: number;
}

// 协作者相关类型
export interface Collaborator {
  id: string;
  userId: string;
  user: User;
  activityId: string;
  permissions: ('view' | 'edit' | 'control')[];
  invitedAt: string;
  acceptedAt?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface InviteCollaboratorRequest {
  email: string;
  permissions: ('view' | 'edit' | 'control')[];
}

// 参与者相关类型
export interface Participant {
  id: string;
  participantNumber: string;
  activityId: string;
  joinedAt: string;
  status: 'active' | 'inactive';
  lastActiveAt?: string;
}

export interface CreateParticipantsRequest {
  count: number;
  prefix?: string;
}

// 投票相关类型
export interface Vote {
  id: string;
  participantId: string;
  debateId: string;
  position: 'pro' | 'con' | 'abstain';
  votedAt: string;
  updatedAt: string;
}

export interface ParticipantEnterResponse {
  sessionToken: string;
  participant: {
    id: string;
    code: string;
    activityId: string;
  };
}

export interface VoteRequest {
  sessionToken: string;
  position: 'pro' | 'con' | 'abstain';
}

export interface VoteStatus {
  hasVoted: boolean;
  currentVote?: {
    position: 'pro' | 'con' | 'abstain';
    votedAt: string;
  };
  canChangeVote: boolean;
}

export interface VoteResults {
  debateId: string;
  totalVotes: number;
  proVotes: number;
  conVotes: number;
  abstainVotes: number;
  proPercentage: number;
  conPercentage: number;
  abstainPercentage: number;
  voteHistory: VoteHistoryItem[];
}

export interface VoteHistoryItem {
  timestamp: string;
  proCount: number;
  conCount: number;
  abstainCount: number;
}

// 大屏展示相关类型
export interface ScreenConfig {
  activityId: string;
  currentDebateId?: string;
  displayMode: 'current' | 'pro' | 'con' | 'comparison';
  theme: 'classic' | 'tech' | 'minimal';
  showPercentage: boolean;
  showHistory: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface ScreenData {
  activity: Activity;
  currentDebate?: Debate;
  voteResults?: VoteResults;
  config: ScreenConfig;
}

// 统计相关类型
export interface DashboardData {
  totalParticipants: number;
  activeParticipants: number;
  totalVotes: number;
  currentDebate?: Debate;
  recentVotes: Vote[];
  voteDistribution: {
    pro: number;
    con: number;
    abstain: number;
  };
}

export interface ActivityReport {
  activity: Activity;
  summary: {
    totalParticipants: number;
    totalVotes: number;
    averageParticipation: number;
    duration: number;
  };
  debates: Array<{
    debate: Debate;
    results: VoteResults;
    participation: number;
  }>;
  timeline: Array<{
    timestamp: string;
    event: string;
    description: string;
  }>;
}

// 站点信息类型
export interface SiteInfo {
  title: string;
  description: string;
  openRegister: boolean;
  icon?: string;
  contact?: string;
  icp?: string;
  footerText?: string;
}

// 查询参数类型
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UserListParams extends PaginationParams {
  search?: string;
}

export interface UserUpdateRequest {
  name?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  role?: 'admin' | 'organizer';
}

export interface ActivityListParams extends PaginationParams {
  status?: 'upcoming' | 'ongoing' | 'ended';
  role?: 'owner' | 'collaborator';
  search?: string;
}

export interface ParticipantListParams extends PaginationParams {
  status?: 'active' | 'inactive';
  search?: string;
}
