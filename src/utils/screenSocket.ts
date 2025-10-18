/**
 * Socket.IO Client Manager for Screen Real-time Updates
 * 大屏实时数据 Socket.IO 客户端管理器
 */
import { io, Socket } from 'socket.io-client';
import toast from '@/utils/toast';
import type { ScreenStatistics, VoteUpdate, DebateChange, DebateStatus } from '@/types/screen';

export interface SocketConfig {
  url: string;
  path?: string;
  autoConnect?: boolean;
}

export interface SocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onVoteUpdate?: (data: VoteUpdate) => void;
  onStatisticsUpdate?: (data: ScreenStatistics) => void;
  onDebateChange?: (data: DebateChange) => void;
  onDebateStatus?: (data: DebateStatus) => void;
}

class ScreenSocketManager {
  private socket: Socket | null = null;
  private config: SocketConfig;
  private handlers: SocketEventHandlers = {};
  private currentActivityId: string | null = null;

  constructor(config: SocketConfig) {
    this.config = {
      path: '/socket.io',
      autoConnect: false,
      ...config,
    };
  }

  /**
   * 初始化 Socket 连接
   */
  connect(): void {
    if (this.socket?.connected) {
      //   console.warn('Socket is already connected');
      return;
    }

    this.socket = io(this.config.url, {
      path: this.config.path,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: this.config.autoConnect,
    });

    this.registerEventListeners();

    if (!this.config.autoConnect) {
      this.socket.connect();
    }
  }

  /**
   * 注册所有事件监听器
   */
  private registerEventListeners(): void {
    if (!this.socket) return;

    // 连接事件
    this.socket.on('connect', () => {
      //   console.log('✅ Socket.IO connected:', this.socket?.id);
      this.handlers.onConnect?.();
    });

    this.socket.on('disconnect', (reason: string) => {
      //   console.log('❌ Socket.IO disconnected:', reason);
      this.handlers.onDisconnect?.(reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      // console.error('❌ Socket.IO connection error:', error);
      this.handlers.onError?.(error);
    });

    // 连接状态事件
    this.socket.on('connection_status', (data: { status: string; session_id: string; timestamp: string }) => {
      if (data.status === 'connected') {
        toast.success('已连接到实时数据服务');
      }
    });

    this.socket.on('joined_screen', (data: { activity_id: string; session_id: string; timestamp: string }) => {
      toast.info(`已加入活动 ${data.activity_id} 的大屏房间`);
    });

    this.socket.on('left_screen', (data: { activity_id: string; session_id: string; timestamp: string }) => {
      toast.info(`已离开活动 ${data.activity_id} 的大屏房间`);
    });

    // 业务数据事件
    this.socket.on('vote_update', (data: VoteUpdate) => {
      // console.log('📊 Vote update received:', data);
      this.handlers.onVoteUpdate?.(data);
    });

    this.socket.on('statistics_update', (data: ScreenStatistics) => {
      // console.log('📈 Statistics update received:', data);
      this.handlers.onStatisticsUpdate?.(data);
    });

    this.socket.on('debate_change', (data: DebateChange) => {
      // console.log('🔄 Debate change received:', data);
      this.handlers.onDebateChange?.(data);
    });

    this.socket.on('debate_status', (data: DebateStatus) => {
      // console.log('📌 Debate status received:', data);
      this.handlers.onDebateStatus?.(data);
    });

    // 错误事件
    this.socket.on('error', (data: { message: string }) => {
      // console.error('Socket error:', data);
      this.handlers.onError?.(new Error(data.message));
    });
  }

  /**
   * 设置事件处理器
   */
  setHandlers(handlers: SocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * 加入大屏房间
   */
  joinScreen(activityId: string, userInfo?: Record<string, unknown>): void {
    if (!this.socket?.connected) {
      // console.error('Socket is not connected');
      return;
    }

    this.currentActivityId = activityId;
    this.socket.emit('join_screen', {
      activity_id: activityId,
      user_info: userInfo,
    });
  }

  /**
   * 离开大屏房间
   */
  leaveScreen(): void {
    if (!this.socket?.connected || !this.currentActivityId) {
      return;
    }

    this.socket.emit('leave_screen', {
      activity_id: this.currentActivityId,
    });

    this.currentActivityId = null;
  }

  /**
   * 请求大屏数据
   */
  requestScreenData(activityId: string): void {
    if (!this.socket?.connected) {
      // console.error('Socket is not connected');
      return;
    }

    this.socket.emit('request_screen_data', {
      activity_id: activityId,
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.currentActivityId) {
      this.leaveScreen();
    }

    this.socket?.disconnect();
    this.socket = null;
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * 获取 Socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * 获取当前活动 ID
   */
  getCurrentActivityId(): string | null {
    return this.currentActivityId;
  }
}

// 创建单例实例
let screenSocketManager: ScreenSocketManager | null = null;

/**
 * 获取或创建 ScreenSocketManager 实例
 */
export function getScreenSocketManager(config?: SocketConfig): ScreenSocketManager {
  if (!screenSocketManager && config) {
    screenSocketManager = new ScreenSocketManager(config);
  }

  if (!screenSocketManager) {
    throw new Error('ScreenSocketManager is not initialized. Please provide config on first call.');
  }

  return screenSocketManager;
}

/**
 * 销毁 ScreenSocketManager 实例
 */
export function destroyScreenSocketManager(): void {
  if (screenSocketManager) {
    screenSocketManager.disconnect();
    screenSocketManager = null;
  }
}

export default ScreenSocketManager;
