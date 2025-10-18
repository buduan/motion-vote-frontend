/**
 * Screen Socket Composable
 * 大屏 Socket 连接的 Vue Composable
 */
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getScreenSocketManager, type SocketEventHandlers } from '@/utils/screenSocket';
import type { ScreenStatistics, VoteUpdate, DebateChange, DebateStatus } from '@/types/screen';

export interface UseScreenSocketOptions {
  url?: string;
  activityId: string;
  autoConnect?: boolean;
  handlers?: SocketEventHandlers;
}

export function useScreenSocket(options: UseScreenSocketOptions) {
  // 从 VITE_API_BASE_URL 中移除 /api 后缀，因为 WebSocket 在根路径
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const wsUrl = baseUrl.replace(/\/api\/?$/, '');

  const { url = wsUrl, activityId, autoConnect = true, handlers = {} } = options;

  // 状态
  const isConnected = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const showConnectionStatus = ref(false); // 控制是否显示连接状态
  const connectionAttempts = ref(0); // 连接尝试次数

  // 数据
  const statistics = ref<ScreenStatistics | null>(null);
  const latestVoteUpdate = ref<VoteUpdate | null>(null);
  const latestDebateChange = ref<DebateChange | null>(null);
  const latestDebateStatus = ref<DebateStatus | null>(null);

  // Socket 管理器
  const socketManager = getScreenSocketManager({
    url,
    autoConnect: false,
  });

  // 内部事件处理器
  const internalHandlers: SocketEventHandlers = {
    onConnect: () => {
      isConnected.value = true;
      showConnectionStatus.value = false; // 连接成功，隐藏状态提示
      connectionAttempts.value = 0;
      error.value = null;
      handlers.onConnect?.();

      // 加入房间
      if (activityId) {
        socketManager.joinScreen(activityId);
      }
    },

    onDisconnect: reason => {
      isConnected.value = false;
      showConnectionStatus.value = true; // 断开连接，显示状态提示
      handlers.onDisconnect?.(reason);
    },

    onError: err => {
      error.value = err.message;
      connectionAttempts.value += 1;
      // 多次尝试失败后显示连接状态
      if (connectionAttempts.value >= 2) {
        showConnectionStatus.value = true;
      }
      handlers.onError?.(err);
    },

    onVoteUpdate: data => {
      latestVoteUpdate.value = data;
      handlers.onVoteUpdate?.(data);
    },

    onStatisticsUpdate: data => {
      statistics.value = data;
      handlers.onStatisticsUpdate?.(data);
    },

    onDebateChange: data => {
      latestDebateChange.value = data;
      handlers.onDebateChange?.(data);
    },

    onDebateStatus: data => {
      latestDebateStatus.value = data;
      handlers.onDebateStatus?.(data);
    },
  };

  // 连接
  const connect = () => {
    try {
      isLoading.value = true;
      error.value = null;

      socketManager.setHandlers(internalHandlers);
      socketManager.connect();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to connect';
    } finally {
      isLoading.value = false;
    }
  };

  // 断开连接
  const disconnect = () => {
    socketManager.disconnect();
    isConnected.value = false;
  };

  // 请求数据
  const requestData = () => {
    if (activityId) {
      socketManager.requestScreenData(activityId);
    }
  };

  // 计算属性
  const socketId = computed(() => socketManager.getSocketId());

  // 生命周期
  onMounted(() => {
    if (autoConnect) {
      connect();
    }
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    // 状态
    isConnected,
    isLoading,
    error,
    showConnectionStatus,

    // 数据
    statistics,
    latestVoteUpdate,
    latestDebateChange,
    latestDebateStatus,

    // 方法
    connect,
    disconnect,
    requestData,

    // 信息
    socketId,
  };
}
