// API response base type
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

// Paginated response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'admin' | 'organizer';
  created_at: string;
  updated_at: string;
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

// Activity related types
export interface Activity {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  coverImage?: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  expectedParticipants?: number;
  actualParticipants?: number;
  currentParticipants: number;
  tags?: string[];
  ownerId: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityDetail extends Activity {
  settings?: ActivitySettings;
  debates: Debate[];
  collaborators: Collaborator[];
  participants: Participant[];
  currentDebate?: Debate;
  statistics?: {
    totalParticipants: number;
    checkedInParticipants: number;
    totalVotes: number;
    totalDebates: number;
  };
}

export interface ActivitySettings {
  allowVoteChange: boolean;
  maxVoteChanges?: number;
  showRealTimeResults: boolean;
  requireCheckIn: boolean;
  anonymousVoting: boolean;
  autoLockVotes: boolean;
  lockVoteDelay?: number;
}

export interface CreateActivityRequest {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  coverImage?: string;
  expectedParticipants?: number;
  tags?: string[];
  settings: ActivitySettings;
}

// Debate related types
export interface DebateStage {
  stageName: string;
  isDualSide: boolean;
  sides: {
    name: string;
    duration: number;
  }[];
  bellTimings: {
    time: number;
    type: 'start' | 'warning' | 'end';
  }[];
  hideTimer?: boolean;
}

export interface Debate {
  id: string;
  title: string;
  proDescription: string;
  conDescription: string;
  background?: string;
  estimatedDuration?: number;
  order: number;
  status: 'pending' | 'ongoing' | 'final_vote' | 'ended';
  activityId: string;
  createdAt: string;
  updatedAt: string;
  stages?: DebateStage[];
  backgroundImageUrl?: string;
}

export interface CreateDebateRequest {
  title: string;
  proDescription: string;
  conDescription: string;
  background?: string;
  estimatedDuration?: number;
  order?: number;
}

// Collaborator related types
export interface Collaborator {
  id: string;
  userId: string;
  user: User;
  activityId: string;
  permissions: ('view' | 'edit' | 'control')[];
  invitedAt: string;
}

export interface InviteCollaboratorRequest {
  email: string;
  permissions: ('view' | 'edit' | 'control')[];
}

// Participant related types
export interface Participant {
  id: string;
  activityId: string;
  code: string;
  participantNumber: string; // Alias for code
  name?: string;
  phone?: string;
  note?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  deviceFingerprint?: string;
  joinedAt: string; // Alias for createdAt
  status: 'active' | 'inactive';
  lastActiveAt?: string;
  createdAt: string;
}

export interface CreateParticipantsRequest {
  count: number;
  prefix?: string;
}

export interface AddParticipantRequest {
  name?: string;
  phone?: string;
  note?: string;
}

// Vote related types
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
  activity?: {
    id: string;
    name: string;
    status: string;
  };
  participant: {
    id: string;
    code: string;
    name?: string;
    activityId?: string;
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

export interface VoteStats {
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

// Screen display related types
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
  VoteStats?: VoteStats;
  config: ScreenConfig;
}

// Statistics related types
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
    results: VoteStats;
    participation: number;
  }>;
  timeline: Array<{
    timestamp: string;
    event: string;
    description: string;
  }>;
}

// Site info types
export interface SiteInfo {
  title: string;
  description: string;
  openRegister: boolean;
  icon?: string;
  contact?: string;
  icp?: string;
  footerText?: string;
}

// Query parameter types
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
  avatar?: string;
  role?: 'admin' | 'organizer';
}

export interface ActivityListParams extends PaginationParams {
  status?: 'upcoming' | 'ongoing' | 'ended' | '';
  role?: 'owner' | 'collaborator' | '';
  search?: string;
}

export interface ParticipantListParams extends PaginationParams {
  status?: 'active' | 'inactive';
  search?: string;
}
