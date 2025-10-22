<template>
  <!-- Selector -->
  <Transition name="fade">
    <div v-if="showSelector" class="absolute top-4 right-4">
      <div class="selector">
        <select v-model="selectedOption" class="select">
          <option value="topic">Topic</option>
          <option value="pro">Pros</option>
          <option value="con">Cons</option>
          <option value="both">Both</option>
          <option value="timer">Timer</option>
        </select>
      </div>
    </div>
  </Transition>

  <!-- Logo -->
  <div 
    class="absolute h-12 w-auto logo-flying"
    :class="isLogoFlying ? '' : 'top-4 left-4'"
    :style="isLogoFlying ? { 
      top: logoPosition.y + 'px', 
      left: logoPosition.x + 'px',
      transform: `scale(${logoScale})`
    } : {}"
  >
    <img src="@/assets/logo.jpg" alt="Logo" class="w-16 h-16" />
  </div>

  <div
    class="p-16 flex flex-col h-screen"
    :class="{
      'items-center align-center text-center': selectedOption === 'topic',
      'items-start': selectedOption === 'pro' || selectedOption === 'con' || selectedOption === 'both',
      'justify-center': selectedOption === 'topic',
      'justify-start': selectedOption === 'pro' || selectedOption === 'con' || selectedOption === 'both',
    }"
    v-if="selectedOption !== 'timer'"
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
            : ''
        "
      >
        {{ debateTitle || '等待辩题...' }}
      </h1>
    </div>

    <!-- Vote Statistics -->
    <div v-if="selectedOption !== 'topic' && currentDebateStats" class="w-full">
      <!-- Pro Side -->
      <div v-if="selectedOption === 'pro' || selectedOption === 'both'" class="w-full mb-8">
        <div class="w-full flex justify-between">
          <h2 class="text-8xl/[1.5] font-black mb-4">正方</h2>
          <h2 class="text-8xl/[1.5] font-bold mb-4 font-number text-blue-500">
            {{ currentDebateStats.proPercentage.toFixed(1) }}%
          </h2>
        </div>
        <VoteBar side="pro" :percent="currentDebateStats.proPercentage" class="w-full h-16" />
        <p class="text-2xl mt-2 text-gray-500">{{ currentDebateStats.proVotes }} 票</p>
      </div>

      <!-- Con Side -->
      <div v-if="selectedOption === 'con' || selectedOption === 'both'" class="w-full">
        <div class="w-full flex justify-between">
          <h2 class="text-8xl/[1.5] font-black mb-4">反方</h2>
          <h2 class="text-8xl/[1.5] font-bold mb-4 font-number text-red-500">
            {{ currentDebateStats.conPercentage.toFixed(1) }}%
          </h2>
        </div>
        <VoteBar side="con" :percent="currentDebateStats.conPercentage" class="w-full h-16" />
        <p class="text-2xl mt-2 text-gray-500">{{ currentDebateStats.conVotes }} 票</p>
      </div>

      <!-- Total Votes Info -->
      <div v-if="selectedOption === 'both'" class="w-full mt-4 text-center">
        <p class="text-xl text-gray-400">
          总投票数: {{ currentDebateStats.totalVotes }} | 弃权: {{ currentDebateStats.abstainVotes }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!currentDebateStats && selectedOption !== 'topic'" class="w-full text-center">
      <p class="text-3xl text-gray-400">等待投票数据...</p>
    </div>
  </div>

  <!-- Timer View -->
  <DebateTimer 
    v-if="selectedOption === 'timer'" 
    :timer-data="timerData"
    @timer-end="handleTimerEnd"
  />

  <!-- Connection Status - Bottom Right Corner -->
  <Transition name="fade">
    <div v-if="showConnectionStatus" class="fixed bottom-4 right-4 z-50">
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
import type { ScreenStatistics, TimerData } from '@/types/screen';

const route = useRoute();
const selectedOption = ref('topic');
const showSelector = ref(false);

// Timer data state
const timerData = ref<TimerData | null>(null);

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

// WebSocket 连接
const { statistics, isConnected, showConnectionStatus, connect, disconnect } = useScreenWebSocket({
  activityId: activityId.value,
  autoConnect: false,
});

// 从统计数据中提取信息
const activityName = computed(() => statistics.value?.data?.activityName || '');
const debateTitle = computed(() => statistics.value?.data?.currentDebate?.title || '等待辩题...');
const currentDebateStats = computed(() => statistics.value?.data?.currentDebateStats);

// Timer handler
const handleTimerEnd = (sideIndex: number) => {
  console.log(`计时器结束: 侧面 ${sideIndex}`);
  // TODO: 添加额外的处理逻辑，如通知后端
};

// Load timer data when switching to timer mode
watch(selectedOption, async (newOption) => {
  if (newOption === 'timer' && activityId.value) {
    try {
      // 尝试从 API 加载计时器数据
      const response = await ScreenApi.getTimerConfig(activityId.value);
      if (response.success && response.data) {
        timerData.value = response.data;
      } else {
        // API 失败时使用模拟数据
        loadMockTimerData();
      }
    } catch (error) {
      // API 尚未实现，使用模拟数据
      console.log('Timer API not implemented yet, using mock data');
      loadMockTimerData();
    }
  }
});

// Load mock timer data
const loadMockTimerData = () => {
  timerData.value = {
    activityName: activityName.value || '辩论赛活动',
    debateTitle: debateTitle.value || '辩题',
    stages: [
      {
        stageName: '开场陈词',
        isDualSide: false,
        sides: [{ name: '主持人', duration: 60 }],
        bellTimings: [{ time: 0, type: 'start' }, { time: 60, type: 'end' }],
        hideTimer: true, // 不显示计时器
      },
      {
        stageName: '立论阶段 - 正方',
        isDualSide: false,
        sides: [{ name: '正方一辩', duration: 180 }],
        bellTimings: [
          { time: 0, type: 'start' },
          { time: 150, type: 'warning' },
          { time: 180, type: 'end' },
        ],
      },
      {
        stageName: '立论阶段 - 反方',
        isDualSide: false,
        sides: [{ name: '反方一辩', duration: 180 }],
        bellTimings: [
          { time: 0, type: 'start' },
          { time: 150, type: 'warning' },
          { time: 180, type: 'end' },
        ],
      },
      {
        stageName: '攻辩环节',
        isDualSide: true,
        sides: [
          { name: '正方二辩', duration: 90 },
          { name: '反方二辩', duration: 90 },
        ],
        bellTimings: [
          { time: 0, type: 'start' },
          { time: 75, type: 'warning' },
          { time: 90, type: 'end' },
        ],
      },
      {
        stageName: '自由辩论',
        isDualSide: true,
        sides: [
          { name: '正方', duration: 240 },
          { name: '反方', duration: 240 },
        ],
        bellTimings: [
          { time: 0, type: 'start' },
          { time: 210, type: 'warning' },
          { time: 240, type: 'end' },
        ],
      },
      {
        stageName: '总结陈词 - 反方',
        isDualSide: false,
        sides: [{ name: '反方四辩', duration: 180 }],
        bellTimings: [
          { time: 0, type: 'start' },
          { time: 150, type: 'warning' },
          { time: 180, type: 'end' },
        ],
      },
      {
        stageName: '总结陈词 - 正方',
        isDualSide: false,
        sides: [{ name: '正方四辩', duration: 180 }],
        bellTimings: [
          { time: 0, type: 'start' },
          { time: 150, type: 'warning' },
          { time: 180, type: 'end' },
        ],
      },
    ],
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
  // 添加键盘事件监听
  window.addEventListener('keypress', handleKeyPress);
  
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
            timestamp: res.data.timestamp,
          } as ScreenStatistics;

          // 设置展示文本
          // 这些是 computed 的源数据，因此我们 don't mutate computed directly; using underlying refs via statistics
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
  window.removeEventListener('keypress', handleKeyPress);
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
</style>
