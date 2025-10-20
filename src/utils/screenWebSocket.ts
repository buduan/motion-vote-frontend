/**
 * WebSocket Client Manager for Screen Real-time Updates
 * 大屏实时数据 WebSocket 客户端管理器（原生 WebSocket）
 */
import toast from '@/utils/toast';
import type { ScreenStatistics, VoteUpdate, DebateChange, DebateStatus } from '@/types/screen';

export interface WebSocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onVoteUpdate?: (data: VoteUpdate) => void;
  onStatisticsUpdate?: (data: ScreenStatistics) => void;
  onDebateChange?: (data: DebateChange) => void;
  onDebateStatus?: (data: DebateStatus) => void;
}

interface WebSocketMessage {
  type: string;
  event?: string;
  [key: string]: unknown;
}

class ScreenWebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private handlers: WebSocketEventHandlers = {};
  private currentActivityId: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private isManualClose = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      autoConnect: config.autoConnect ?? false,
      reconnectDelay: config.reconnectDelay ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
    };
  }

  /**
   * 初始化 WebSocket 连接
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      //   console.warn('WebSocket is already connected or connecting');
      return;
    }

    this.isManualClose = false;

    // 构建 WebSocket URL
    const wsUrl = this.buildWebSocketUrl(this.config.url);

    // 调试信息
    if (import.meta.env.DEV) {
      //   console.log('🔗 Connecting to WebSocket:', wsUrl);
    }

    try {
      this.ws = new WebSocket(wsUrl);
      this.registerEventListeners();
    } catch {
      //   console.error('❌ WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  /**
   * 构建 WebSocket URL
   */
  private buildWebSocketUrl(baseUrl: string): string {
    // 移除 /api 后缀
    let url = baseUrl.replace(/\/api\/?$/, '');

    // 转换 HTTP(S) 到 WS(S)
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'ws://');
    } else if (url.startsWith('https://')) {
      url = url.replace('https://', 'wss://');
    } else if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      // 如果没有协议，根据当前页面协议添加
      url = window.location.protocol === 'https:' ? `wss://${url}` : `ws://${url}`;
    }

    // 添加 WebSocket 路径
    if (this.currentActivityId) {
      url += `/api/ws/screen/${this.currentActivityId}`;
    } else {
      url += '/api/ws/screen';
    }

    return url;
  }

  /**
   * 注册所有事件监听器
   */
  private registerEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      //   console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.handlers.onConnect?.();
    };

    this.ws.onclose = event => {
      //   console.log('❌ WebSocket disconnected:', event.code, event.reason);
      this.stopHeartbeat();
      this.handlers.onDisconnect?.(event.reason || 'Connection closed');

      if (!this.isManualClose) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = () => {
      //   console.error('❌ WebSocket error:', error);
      this.handlers.onError?.(new Error('WebSocket error'));
    };

    this.ws.onmessage = event => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch {
        // console.error('❌ Failed to parse WebSocket message:', error);
      }
    };
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    const { type, event } = message;

    // 根据消息类型或事件分发
    const eventName = event || type;

    switch (eventName) {
      case 'connection_status':
        // console.log('📡 Connection status:', message);
        break;

      case 'joined_screen':
        // console.log('✅ Joined screen:', message.activity_id);
        break;

      case 'left_screen':
        // console.log('📤 Left screen:', message.activity_id);
        break;

      case 'pong':
        // 心跳响应
        break;

      case 'vote_update':
        this.handlers.onVoteUpdate?.(message.data as VoteUpdate);
        break;

      case 'statistics_update':
        this.handlers.onStatisticsUpdate?.(message.data as ScreenStatistics);
        break;

      case 'debate_change':
        this.handlers.onDebateChange?.(message.data as DebateChange);
        break;

      case 'debate_status':
        this.handlers.onDebateStatus?.(message as unknown as DebateStatus);
        break;

      case 'error':
        // eslint-disable-next-line no-console
        console.error('❌ Server error:', message.message);
        toast.error((message.message as string) || 'Server error');
        break;

      default:
        // eslint-disable-next-line no-console
        console.log('📨 Received message:', message);
    }
  }

  /**
   * 发送消息
   */
  private send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      //   console.warn('⚠️ WebSocket is not connected');
    }
  }

  /**
   * 心跳检测
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      this.send({
        type: 'ping',
        timestamp: Date.now(),
      });
    }, 30000); // 每 30 秒发送一次心跳
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 重连处理
   */
  private handleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      //   console.error('❌ Max reconnection attempts reached');
      toast.error('连接已断开，请刷新页面重试');
      this.handlers.onError?.(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    // console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, this.config.reconnectDelay);
  }

  /**
   * 设置事件处理器
   */
  setHandlers(handlers: WebSocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * 加入大屏房间
   */
  joinScreen(activityId: string, userInfo?: Record<string, unknown>): void {
    this.currentActivityId = activityId;
    this.send({
      type: 'join_screen',
      activity_id: activityId,
      user_info: userInfo,
    });
  }

  /**
   * 离开大屏房间
   */
  leaveScreen(): void {
    if (this.currentActivityId) {
      this.send({
        type: 'leave_screen',
      });
      this.currentActivityId = null;
    }
  }

  /**
   * 请求大屏数据
   */
  requestScreenData(activityId: string): void {
    this.send({
      type: 'request_screen_data',
      activity_id: activityId,
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.currentActivityId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * 获取连接状态
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 获取当前活动 ID
   */
  getCurrentActivityId(): string | null {
    return this.currentActivityId;
  }
}

// 全局实例管理
let globalSocketManager: ScreenWebSocketManager | null = null;

export function getScreenWebSocketManager(config?: WebSocketConfig): ScreenWebSocketManager {
  if (!globalSocketManager && config) {
    globalSocketManager = new ScreenWebSocketManager(config);
  }

  if (!globalSocketManager) {
    throw new Error('WebSocket manager not initialized. Please provide config on first call.');
  }

  return globalSocketManager;
}

export function resetScreenWebSocketManager(): void {
  if (globalSocketManager) {
    globalSocketManager.disconnect();
    globalSocketManager = null;
  }
}

export default ScreenWebSocketManager;
