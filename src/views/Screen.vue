<template>
  <!-- Selector and Keyboard Shortcuts -->
  <Transition name="fade">
    <div v-if="showSelector" class="absolute top-4 right-4 flex gap-2 z-50">
      <div class="selector">
        <select v-model="selectedOption" class="select">
          <option value="topic">Topic</option>
          <option value="pro">Pros</option>
          <option value="con">Cons</option>
          <option value="both">Both</option>
        </select>
      </div>
    </div>
  </Transition>

  <!-- Logo -->
  <div
    class="absolute h-12 w-auto logo-flying"
    :class="isLogoFlying ? '' : 'top-4 left-4'"
    :style="
      isLogoFlying
        ? {
            top: logoPosition.y + 'px',
            left: logoPosition.x + 'px',
            transform: `scale(${logoScale})`,
          }
        : {}
    "
  >
    <img src="@/assets/logo.jpg" alt="Logo" class="w-16 h-16" />
  </div>

  <div
    v-if="selectedOption !== 'topic' || (selectedOption === 'topic' && !isTimerMode)"
    class="p-16 flex flex-col h-screen"
    :class="{
      'items-center align-center text-center': selectedOption === 'topic',
      'items-start': selectedOption === 'pro' || selectedOption === 'con' || selectedOption === 'both',
      'justify-center': selectedOption === 'topic',
      'justify-start': selectedOption === 'pro' || selectedOption === 'con' || selectedOption === 'both',
    }"
  >
    <!-- Debate Topic -->
    <div class="w-full mt-4" :class="{ 'h-3/5 overflow-hidden': selectedOption !== 'topic' }">
      <h3 v-if="selectedOption === 'topic'" class="text-4xl/[1.5] font-bold mb-4">
        {{ activityName || '加载中...' }}
      </h3>
      <h1
        class="text-9xl/[1.5] font-black mb-4"
        :class="
          selectedOption === 'topic'
            ? ' bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent'
            : 'text-base-content'
        "
      >
        {{ debateTitle }}
      </h1>
    </div>

    <!-- Vote Statistics -->
    <div v-if="selectedOption !== 'topic' && currentDebateStats" class="w-full">
      <!-- Both View - Merged Display using existing VoteBar -->
      <div v-if="selectedOption === 'both'" class="w-full">
        <!-- 顶部：显示双方名称和分数 -->
        <div class="flex justify-between items-center mb-6">
          <!-- 左侧：正方 -->
          <div class="flex items-center gap-4">
            <h2 class="text-6xl font-black text-blue-400">正方</h2>
            <h2 class="text-6xl font-bold text-blue-400 font-number">
              {{ currentDebateStats.proScore.toFixed(1) }}
            </h2>
          </div>

          <!-- 右侧：反方 -->
          <div class="flex items-center gap-4">
            <h2 class="text-6xl font-bold text-red-400 font-number">
              {{ currentDebateStats.conScore.toFixed(1) }}
            </h2>
            <h2 class="text-6xl font-black text-red-400">反方</h2>
          </div>
        </div>

        <!-- 合并的进度条容器 - 显示：正方票数|未投票人数|反方票数 -->
        <div class="relative w-full h-16 mb-4 bg-gray-200 rounded-full border-4 border-base-content/30">
          <!-- 正方进度条 (从左开始，宽度为正方票数比例) -->
          <div
            class="absolute top-0 left-0 h-full bg-blue-500 rounded-l-full transition-all duration-500 ease-out"
            :style="{ width: `${currentDebateStats.proProgressPercentage}%` }"
          ></div>

          <!-- 反方进度条 (从右开始，宽度为反方票数比例) -->
          <div
            class="absolute top-0 right-0 h-full bg-red-500 rounded-r-full transition-all duration-500 ease-out"
            :style="{ width: `${currentDebateStats.conProgressPercentage}%` }"
          ></div>

          <!-- 中间是灰色区域，代表未投票人数，无需额外div -->
        </div>

        <!-- 底部：票数统计 -->
        <div class="flex justify-between items-center">
          <!-- 左侧：正方票数 -->
          <div class="text-blue-400">
            <span class="text-2xl font-bold">{{ currentDebateStats.proVotes }} 票</span>
          </div>

          <!-- 中间：未投票人数 -->
          <div class="text-base-content/60">
            <span class="text-xl">未投票 {{ currentDebateStats.nonVotingParticipants }} 人</span>
          </div>

          <!-- 右侧：反方票数 -->
          <div class="text-red-400">
            <span class="text-2xl font-bold">{{ currentDebateStats.conVotes }} 票</span>
          </div>
        </div>
      </div>

      <!-- Pro Side Only -->
      <div v-if="selectedOption === 'pro'" class="w-full mb-8">
        <div class="w-full flex justify-between">
          <h2 class="text-8xl/[1.5] font-black mb-4">正方</h2>
          <h2 class="text-8xl/[1.5] font-bold mb-4 font-number text-blue-400">
            {{ currentDebateStats.proScore.toFixed(1) }}
          </h2>
        </div>
        <VoteBar side="pro" :percent="currentDebateStats.proProgressPercentage" class="w-full h-16" />
        <p class="text-2xl mt-2 text-base-content/70">{{ currentDebateStats.proVotes }} 票</p>
      </div>

      <!-- Con Side Only -->
      <div v-if="selectedOption === 'con'" class="w-full">
        <div class="w-full flex justify-between">
          <h2 class="text-8xl/[1.5] font-black mb-4">反方</h2>
          <h2 class="text-8xl/[1.5] font-bold mb-4 font-number text-red-400">
            {{ currentDebateStats.conScore.toFixed(1) }}
          </h2>
        </div>
        <VoteBar side="con" :percent="currentDebateStats.conProgressPercentage" class="w-full h-16" />
        <p class="text-2xl mt-2 text-base-content/70">{{ currentDebateStats.conVotes }} 票</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!currentDebateStats && selectedOption !== 'topic'" class="w-full text-center">
      <p class="text-3xl text-base-content/60">等待投票数据...</p>
    </div>
  </div>

  <!-- Timer View -->
  <DebateTimer
    v-if="selectedOption === 'topic' && isTimerMode"
    ref="debateTimerRef"
    :timer-data="timerData"
    @timer-end="handleTimerEnd"
  />

  <!-- Keyboard Hints Overlay (for Timer mode) -->
  <Transition name="fade">
    <div
      v-if="selectedOption === 'topic' && isTimerMode && showKeyboardHints"
      class="absolute top-20 right-4 z-30 bg-base-200 rounded-box shadow-xl p-6 border border-base-300"
    >
      <h3 class="text-xl font-bold mb-4">快捷键说明</h3>
      <div class="space-y-2">
        <div class="flex items-center gap-4">
          <kbd class="kbd kbd-sm">Enter</kbd>
          <span class="text-base-content/70">进入计时页面</span>
        </div>
        <div class="flex items-center gap-4">
          <kbd class="kbd kbd-sm">Esc</kbd>
          <span class="text-base-content/70">回到封面</span>
        </div>
        <div class="flex items-center gap-4">
          <kbd class="kbd kbd-sm">Space</kbd>
          <span class="text-base-content/70">开始/暂停计时</span>
        </div>
        <div class="flex items-center gap-4">
          <kbd class="kbd kbd-sm">S</kbd>
          <span class="text-base-content/70">切换计时侧面</span>
        </div>
        <div class="flex items-center gap-4">
          <kbd class="kbd kbd-sm">R</kbd>
          <span class="text-base-content/70">重置计时器</span>
        </div>
        <div class="flex items-center gap-4">
          <kbd class="kbd kbd-sm">←</kbd>
          <span class="text-base-content/70">上一阶段</span>
        </div>
        <div class="flex items-center gap-4">
          <kbd class="kbd kbd-sm">→</kbd>
          <span class="text-base-content/70">下一阶段</span>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Connection Status - Above Stage Navigation -->
  <Transition name="fade">
    <div
      v-if="showConnectionStatus"
      class="absolute right-4 z-50"
      :class="selectedOption === 'topic' && isTimerMode && hasNextStage ? 'bottom-16' : 'bottom-4'"
    >
      <div class="badge" :class="isConnected ? 'badge-success' : 'badge-error'">
        {{ isConnected ? '已连接' : '未连接' }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// 大屏展示页面
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMouse } from '@vueuse/core';
import { useScreenWebSocket } from '@/composables/useScreenWebSocket';
import VoteBar from '@/components/screen/voteBar.vue';
import DebateTimer from '@/components/screen/debateTimer.vue';
import { ScreenApi } from '@/api/screen';
import { DebatesApi } from '@/api/debates';
import type { ScreenStatistics, TimerData } from '@/types/screen';
import { getDefaultTimerStages } from '@/utils/timerDefaults';

const route = useRoute();
const selectedOption = ref('topic');
const showSelector = ref(false);

// Timer data state
const timerData = ref<TimerData | null>(null);
const showKeyboardHints = ref(false);
const debateTimerRef = ref<InstanceType<typeof DebateTimer> | null>(null);

// Screen control state - true = show timer, false = show topic cover
const isTimerMode = ref(false);

// 彩蛋: 当在屏幕页面输入 "buduan" 时，logo 会开始飞行
const keySequence = ref('');
const isLogoFlying = ref(false);
const logoPosition = ref({ x: 16, y: 16 });
const logoScale = ref(1);
let flyingInterval: number | null = null;

// 获取 activityId（从路由参数或使用默认值）
const activityId = computed(() => {
  return (route.params.activityId as string) || '';
});

// Screen control handler
const handleScreenControl = (data: { action: string }) => {
  const { action } = data;

  switch (action) {
    case 'toggle_cover_page':
      // Toggle between topic cover and timer display
      if (selectedOption.value === 'topic') {
        isTimerMode.value = !isTimerMode.value;
        if (isTimerMode.value) {
          // Switching to timer mode - load timer data if needed
          loadTimerData();
        }
      }
      break;

    case 'next_stage':
      // Only works in timer mode
      if (selectedOption.value === 'topic' && isTimerMode.value) {
        if (debateTimerRef.value) {
          debateTimerRef.value.navigateToNextStage?.();
        }
      }
      break;

    case 'previous_stage':
      // Only works in timer mode
      if (selectedOption.value === 'topic' && isTimerMode.value) {
        if (debateTimerRef.value) {
          debateTimerRef.value.navigateToPreviousStage?.();
        }
      }
      break;

    default:
      // eslint-disable-next-line no-console
      console.warn('Unknown screen control action:', action);
  }
};

// WebSocket 连接 with screen control handler
const { statistics, isConnected, showConnectionStatus, connect, disconnect } = useScreenWebSocket({
  activityId: activityId.value,
  autoConnect: false,
  handlers: {
    onScreenControl: handleScreenControl,
    onStatisticsUpdate: () => {
      // Statistics update handler - data is automatically updated via the statistics ref
      // No additional processing needed here as the composable handles it
    },
    onDebateChange: () => {
      // 辩题切换时重新加载计时器数据
      if (selectedOption.value === 'topic' && isTimerMode.value) {
        loadTimerData();
      }
    },
  },
});

// 从统计数据中提取信息
const activityName = computed(() => {
  const name = statistics.value?.data?.activityName;
  return name || '';
});

const debateTitle = computed(() => {
  const title = statistics.value?.data?.currentDebate?.title;
  return title || '等待辩题...';
});

const currentDebateStats = computed(() => {
  const stats = statistics.value?.data?.voteStats;

  // 如果没有统计数据，返回null
  if (!stats) return null;

  const proVotes = stats.proVotes || 0;
  const conVotes = stats.conVotes || 0;
  const abstainVotes = stats.abstainVotes || 0; // 现在包含未投票人数
  const totalVotes = stats.totalVotes || 0;
  const proScore = stats.proScore || 0;
  const conScore = stats.conScore || 0;

  // 计算参与者信息：
  // totalParticipants = totalVotes (因为现在包含了所有人，包括未投票的)
  // nonVotingParticipants = abstainVotes - 实际的abstain投票数
  // 但我们无法直接区分，所以使用abstainVotes作为未投票人数的上限
  const totalParticipants = totalVotes;
  const nonVotingParticipants = abstainVotes; // 现在abstainVotes包含未投票人数

  // 计算进度条比例：正方票数、未投票人数、反方票数
  const totalForProgress = totalParticipants > 0 ? totalParticipants : Math.max(totalVotes, 1);
  const proProgressPercentage = (proVotes / totalForProgress) * 100;
  const conProgressPercentage = (conVotes / totalForProgress) * 100;
  const nonVotingPercentage = (nonVotingParticipants / totalForProgress) * 100;

  // 计算分数比例（用于分数显示）
  const totalScore = proScore + conScore;
  const proScorePercentage = totalScore > 0 ? (proScore / totalScore) * 100 : 0;
  const conScorePercentage = totalScore > 0 ? (conScore / totalScore) * 100 : 0;

  return {
    totalVotes,
    proVotes,
    conVotes,
    proScore,
    conScore,
    totalParticipants,
    nonVotingParticipants,
    // 进度条用的百分比（基于人数）
    proProgressPercentage,
    conProgressPercentage,
    nonVotingPercentage,
    // 分数用的百分比（基于分数）
    proScorePercentage,
    conScorePercentage,
  };
});

// Check if timer has next stage
const hasNextStage = computed(() => {
  return debateTimerRef.value?.$?.exposed?.hasNextStage ?? false;
});

// Timer handler
const handleTimerEnd = (sideIndex: number) => {
  // eslint-disable-next-line no-console
  console.log(`计时器结束: 侧面 ${sideIndex}`);
  // TODO: 添加额外的处理逻辑，如通知后端
};

// Load timer data from debates API
const loadTimerData = async () => {
  // Get current debate ID from statistics
  const currentDebateId = statistics.value?.data?.currentDebate?.id;

  if (!currentDebateId) {
    // No current debate, use mock data
    loadMockTimerData();
    return;
  }

  try {
    // Fetch debate details from debates API (no caching, fetch every time)
    const response = await DebatesApi.getDebateById(currentDebateId);

    if (response.success && response.data) {
      const debate = response.data;

      // Transform debate data to TimerData format
      if (debate.stages && debate.stages.length > 0) {
        // Process stages and ensure bellTimings exist
        const processedStages = debate.stages.map(stage => ({
          stageName: stage.stageName,
          isDualSide: stage.isDualSide,
          sides: stage.sides.map(side => ({
            name: side.name,
            duration: side.duration,
          })),
          bellTimings:
            stage.bellTimings && stage.bellTimings.length > 0
              ? stage.bellTimings
              : generateDefaultBellTimings(stage.sides),
          hideTimer: stage.hideTimer || false,
        }));

        timerData.value = {
          activityName: activityName.value || '辩论赛活动',
          debateTitle: debate.title,
          stages: processedStages,
          timestamp: new Date().toISOString(),
        };
      } else {
        // No stages defined, use mock data
        loadMockTimerData();
      }
    } else {
      // API failed, use mock data
      loadMockTimerData();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load timer data from debates API:', error);
    loadMockTimerData();
  }
};

// 生成默认的bellTimings（如果API没有提供）
const generateDefaultBellTimings = (sides: { duration: number }[]) => {
  if (!sides || sides.length === 0) return [];

  // 获取最长的duration
  const maxDuration = Math.max(...sides.map(side => side.duration || 0));

  return [
    { time: 0, type: 'start' as const },
    { time: Math.max(0, maxDuration - 30), type: 'warning' as const }, // 倒数30秒
    { time: maxDuration, type: 'end' as const },
  ];
};

// Load mock timer data
const loadMockTimerData = () => {
  timerData.value = {
    activityName: activityName.value || '辩论赛活动',
    debateTitle: debateTitle.value || '辩题',
    stages: getDefaultTimerStages(),
    timestamp: new Date().toISOString(),
  };
};

// 使用VueUse的useMouse钩子获取鼠标位置
const { x, y } = useMouse();

// 定时器引用
let hideTimer: number | null = null;

// 监听鼠标位置变化
watch([x, y], () => {
  // 鼠标移动时显示selector
  showSelector.value = true;

  // 清除之前的定时器
  if (hideTimer) {
    clearTimeout(hideTimer);
  }

  // 设置3秒后隐藏selector
  hideTimer = setTimeout(() => {
    showSelector.value = false;
  }, 3000);
});

// Easter Egg: 键盘监听
const handleKeyPress = (event: KeyboardEvent) => {
  // Handle screen control shortcuts
  if (event.key === 'Enter') {
    // Enter key: toggle to timer mode
    event.preventDefault();
    if (selectedOption.value === 'topic' && !isTimerMode.value) {
      isTimerMode.value = true;
      loadTimerData();
    }
  } else if (event.key === 'Escape') {
    // Escape key: back to cover page
    event.preventDefault();
    if (selectedOption.value === 'topic' && isTimerMode.value) {
      isTimerMode.value = false;
    }
  }

  // Easter egg: "buduan" sequence
  keySequence.value += event.key.toLowerCase();

  // 保持最近6个字符
  if (keySequence.value.length > 6) {
    keySequence.value = keySequence.value.slice(-6);
  }

  // 检查是否输入了 "buduan"
  if (keySequence.value === 'buduan') {
    toggleLogoFlying();
    keySequence.value = ''; // 重置序列
  }
};

// 切换 logo 飞行状态
const toggleLogoFlying = () => {
  isLogoFlying.value = !isLogoFlying.value;

  if (isLogoFlying.value) {
    startLogoFlying();
  } else {
    stopLogoFlying();
  }
};

// 开始 logo 飞行动画
const startLogoFlying = () => {
  const windowWidth = window.innerWidth - 64; // 减去 logo 宽度
  const windowHeight = window.innerHeight - 64; // 减去 logo 高度

  flyingInterval = window.setInterval(() => {
    logoPosition.value = {
      x: Math.random() * windowWidth,
      y: Math.random() * windowHeight,
    };
    // 随机缩放，范围从 0.7 到 2.2 倍
    logoScale.value = 0.7 + Math.random() * 1.5;
  }, 300); // 每 300ms 改变一次位置和大小
};

// 停止 logo 飞行动画
const stopLogoFlying = () => {
  if (flyingInterval) {
    clearInterval(flyingInterval);
    flyingInterval = null;
  }
  // 重置位置和大小
  logoPosition.value = { x: 16, y: 16 };
  logoScale.value = 1;
};

// 组件挂载时连接 WebSocket
onMounted(() => {
  // 添加键盘事件监听 (使用捕获阶段，确保在子组件之前处理)
  window.addEventListener('keydown', handleKeyPress, true);

  // 首先调用一次 display 接口以获取初始化数据
  if (activityId.value) {
    ScreenApi.getDisplay(activityId.value)
      .then(res => {
        if (res && res.success && res.data) {
          // 初始化屏幕显示数据
          statistics.value = {
            type: 'statistics_update',
            activity_id: res.data.activityId,
            data: res.data,
            timestamp: res.data.timestamp || new Date().toISOString(),
          } as ScreenStatistics;
        }
      })
      .catch(() => {
        // ignore initialization errors; WS will still attempt connect
      })
      .finally(() => {
        connect();
      });
  } else {
    connect();
  }
});

// 组件卸载时断开连接
onUnmounted(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeyPress, true);
  // 停止飞行动画
  stopLogoFlying();
  // 断开 WebSocket
  disconnect();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.logo-flying {
  transition:
    top 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: top, left, transform;
}

.font-number {
  font-variant-numeric: tabular-nums;
}
</style>
