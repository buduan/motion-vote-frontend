<template>
  <div class="p-16 flex flex-col h-screen items-center justify-center relative overflow-hidden">
    <!-- Initial View: Exactly like Topic page except bottom hint -->
    <div v-if="!showAllStages" class="flex flex-col items-center align-center text-center justify-center">
      <!-- Debate Topic -->
      <div class="w-full mt-4">
        <h3 class="text-4xl/[1.5] font-bold mb-4">
          {{ timerData?.activityName || '加载中...' }}
        </h3>
        <h1
          class="text-9xl/[1.5] font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent"
        >
          {{ timerData?.debateTitle || '等待辩题...' }}
        </h1>
      </div>
    </div>

    <!-- All Stages View: Full Timer Display -->
    <div v-else class="w-full flex-1 flex flex-col">
      <!-- Debate Title -->
      <div class="w-full mb-8 px-8">
        <h1
          class="text-9xl/[1.5] font-black text-center bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent"
        >
          {{ timerData?.debateTitle || '等待辩题...' }}
        </h1>
      </div>

      <!-- Current Stage Name -->
      <div v-if="currentStage" class="w-full mb-6 px-8">
        <h2 class="text-8xl font-bold text-center text-base-content">
          {{ currentStage.stageName }}
        </h2>
      </div>

      <!-- Timer Display Area -->
      <div
        v-if="currentStage"
        class="w-full flex-1 flex items-center"
        :class="currentStage.isDualSide ? 'justify-between gap-8' : 'justify-center'"
      >
        <!-- Single Timer or Left Timer (Pro Side) -->
        <div v-if="currentStage.sides && currentStage.sides.length > 0" class="timer-side flex-1 flex flex-col">
          <!-- Speaker Name (Centered) -->
          <div class="w-full text-center mb-6">
            <h2
              :class="[
                currentStage.hideTimer
                  ? 'text-9xl/[1.5] font-black text-black whitespace-nowrap overflow-visible'
                  : 'text-8xl/[1.5] font-black',
                !currentStage.hideTimer
                  ? currentSideIndex === 0 && isTimerRunning
                    ? 'text-blue-500'
                    : 'text-gray-500'
                  : '',
              ]"
            >
              {{ currentStage.sides[0]?.name || '发言者' }}
            </h2>
          </div>

          <!-- Timer Display (Centered) - Only if hideTimer is false -->
          <div v-if="!currentStage.hideTimer" class="w-full flex flex-col items-center">
            <div class="timer-display font-number text-9xl/[1.5] font-bold mb-4" :class="getTimeColor(0)">
              {{ formatTime(sideTimers[0] ?? 0) }}
            </div>
          </div>
        </div>

        <!-- Right Timer (Con Side - Dual Side Only) -->
        <div v-if="currentStage.isDualSide && currentStage.sides.length > 1" class="timer-side flex-1 flex flex-col">
          <!-- Speaker Name (Centered) -->
          <div class="w-full text-center mb-6">
            <h2
              :class="[
                currentStage.hideTimer
                  ? 'text-9xl/[1.5] font-black text-black whitespace-nowrap overflow-visible'
                  : 'text-8xl/[1.5] font-black',
                !currentStage.hideTimer
                  ? currentSideIndex === 1 && isTimerRunning
                    ? 'text-red-500'
                    : 'text-gray-500'
                  : '',
              ]"
            >
              {{ currentStage.sides[1]?.name || '发言者' }}
            </h2>
          </div>

          <!-- Timer Display (Centered) - Only if hideTimer is false -->
          <div v-if="!currentStage.hideTimer" class="w-full flex flex-col items-center">
            <div class="timer-display font-number text-9xl/[1.5] font-bold mb-4" :class="getTimeColor(1)">
              {{ formatTime(sideTimers[1] ?? 0) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Stage Navigation - Bottom Corners (Always visible) -->
    </div>

    <!-- Stage Navigation - Bottom Corners (Always visible) -->
    <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
      <!-- Previous Stage -->
      <div v-if="hasPreviousStage" class="flex flex-col items-start pointer-events-auto">
        <button class="btn btn-ghost btn-sm mb-2 opacity-70 hover:opacity-100" @click="navigateToPreviousStage">
          ← 上一阶段
        </button>
        <p class="text-lg text-gray-500 max-w-xs truncate">
          {{ previousStageName }}
        </p>
      </div>
      <div v-else class="w-1"></div>

      <!-- Next Stage -->
      <div v-if="hasNextStage" class="flex flex-col items-end pointer-events-auto">
        <button class="btn btn-ghost btn-sm mb-2 opacity-70 hover:opacity-100" @click="navigateToNextStage">
          下一阶段 →
        </button>
        <p class="text-lg text-gray-500 max-w-xs truncate text-right">
          {{ nextStageName }}
        </p>
      </div>
      <div v-else class="w-1"></div>
    </div>

    <!-- Stage Indicator - Absolutely Centered -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
      <p class="text-xl text-gray-400">{{ currentStageIndex + 1 }} / {{ totalStages }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { TimerData, TimerStage } from '@/types/screen';

const props = defineProps<{
  timerData: TimerData | null;
}>();

const emit = defineEmits<{
  (e: 'timerEnd', sideIndex: number): void;
}>();

// State
const currentStageIndex = ref(0);
const currentSideIndex = ref(0);
const isTimerRunning = ref(false);
const sideTimers = ref<number[]>([]); // 毫秒
const intervalId = ref<number | null>(null);
const showAllStages = ref(false);
const firstBellRung = ref<boolean[]>([]); // 跟踪每个计时器是否已经响过第一次铃
const bellsRung = ref<Set<number>>(new Set()); // 记录已经响过的铃声时间点
const lastTick = ref<number | null>(null); // Date.now() 上一次tick时间

// Computed properties for current stage
const currentStage = computed<TimerStage | null>(() => {
  if (!props.timerData?.stages || props.timerData.stages.length === 0) return null;
  return props.timerData.stages[currentStageIndex.value] || null;
});

const totalStages = computed(() => props.timerData?.stages?.length || 0);

const hasPreviousStage = computed(() => currentStageIndex.value > 0);
const hasNextStage = computed(() => currentStageIndex.value < totalStages.value - 1);

const previousStageName = computed(() => {
  if (!hasPreviousStage.value || !props.timerData?.stages) return '';
  return props.timerData.stages[currentStageIndex.value - 1]?.stageName || '';
});

const nextStageName = computed(() => {
  if (!hasNextStage.value || !props.timerData?.stages) return '';
  return props.timerData.stages[currentStageIndex.value + 1]?.stageName || '';
});

// Initialize timers when data or stage changes
watch(
  [() => props.timerData, currentStageIndex],
  ([newData]) => {
    if (newData && currentStage.value?.sides) {
      sideTimers.value = currentStage.value.sides.map(side => (side.currentTime ?? side.duration) * 1000);
      firstBellRung.value = currentStage.value.sides.map(() => false);
      bellsRung.value = new Set(); // 重置已响铃记录
      currentSideIndex.value = 0;
      isTimerRunning.value = false;
      pauseTimer();
    }
  },
  { immediate: true },
);

// Format time as MM:SS.mmm (三位小数)
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};

// Get time color based on remaining time and bell state
const getTimeColor = (sideIndex: number): string => {
  if (!currentStage.value?.sides[sideIndex]) return 'text-base-content';

  const remaining = sideTimers.value[sideIndex];
  if (remaining === undefined) return 'text-base-content';

  // 最后5秒：红色
  if (remaining <= 5000) return 'text-red-500';

  // 第一次响铃后：黄色
  if (firstBellRung.value[sideIndex]) return 'text-yellow-500';

  // 默认：根据主题色
  return 'text-base-content';
};

// Check and play bell if needed
const checkAndPlayBell = (elapsedMilliseconds: number) => {
  if (!currentStage.value?.bellTimings) return;

  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

  currentStage.value.bellTimings.forEach(bell => {
    // 检查是否到达铃声时间，且该铃声未响过
    if (bell.time === elapsedSeconds && !bellsRung.value.has(bell.time)) {
      playBell(bell.type);
      bellsRung.value.add(bell.time); // 标记该铃声已响过

      // 记录第一次响铃（非start铃）
      if (bell.type === 'warning' && !firstBellRung.value[currentSideIndex.value]) {
        firstBellRung.value[currentSideIndex.value] = true;
      }
    }
  });
};

// Play bell sound
const playBell = (type: 'start' | 'warning' | 'end') => {
  // eslint-disable-next-line no-console
  console.log(`🔔 Bell: ${type}`);

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = type === 'end' ? 800 : type === 'warning' ? 600 : 440;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

// Start or pause timer
const handleStartPause = () => {
  if (isTimerRunning.value) {
    pauseTimer();
  } else {
    startTimer();
  }
};

// Start the timer (use Date.now() delta for precise ms)
const startTimer = () => {
  if (!currentStage.value?.sides) return;

  if (isTimerRunning.value) return;

  isTimerRunning.value = true;
  lastTick.value = Date.now();

  intervalId.value = window.setInterval(() => {
    if (!currentStage.value?.sides) return;
    if (lastTick.value === null) {
      lastTick.value = Date.now();
      return;
    }

    const now = Date.now();
    const delta = now - lastTick.value;
    lastTick.value = now;

    const idx = currentSideIndex.value;
    const currentTimer = sideTimers.value[idx];
    if (currentTimer === undefined) return;

    sideTimers.value[idx] = Math.max(0, currentTimer - delta);

    const side = currentStage.value.sides[idx];
    if (side) {
      const elapsed = side.duration * 1000 - sideTimers.value[idx];
      checkAndPlayBell(elapsed);
    }

    if (sideTimers.value[idx] <= 0) {
      sideTimers.value[idx] = 0;
      playBell('end');
      emit('timerEnd', idx);

      // If dual-side and the other side still has time, switch focus to it and pause
      if (currentStage.value?.isDualSide && currentStage.value.sides.length > 1) {
        const otherSideIndex = idx === 0 ? 1 : 0;
        const otherTimer = sideTimers.value[otherSideIndex];
        if (otherTimer !== undefined && otherTimer > 0) {
          // switch focus but keep paused
          currentSideIndex.value = otherSideIndex;
          pauseTimer();
          return; // stop further processing
        }
      }

      pauseTimer();
    }
  }, 50); // 50ms tick for smooth ms display
};

// Pause the timer
const pauseTimer = () => {
  isTimerRunning.value = false;
  lastTick.value = null;
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// Switch to the other side
const handleSwitchSide = () => {
  if (!currentStage.value?.isDualSide || !currentStage.value.sides || currentStage.value.sides.length < 2) return;

  currentSideIndex.value = currentSideIndex.value === 0 ? 1 : 0;
};

// Reset all timers
const handleReset = () => {
  pauseTimer();

  if (currentStage.value?.sides) {
    sideTimers.value = currentStage.value.sides.map(side => side.duration * 1000);
    firstBellRung.value = currentStage.value.sides.map(() => false);
    bellsRung.value = new Set(); // 重置已响铃记录
  }

  currentSideIndex.value = 0;
};

/**
 * Navigate to the previous stage
 */
const navigateToPreviousStage = () => {
  if (currentStageIndex.value > 0) {
    pauseTimer();
    currentStageIndex.value--;
    showAllStages.value = true;
  } else if (showAllStages.value) {
    // If we're at the first stage and showing all stages, go back to initial topic view
    pauseTimer();
    showAllStages.value = false;
  }
};

/**
 * Navigate to the next stage
 */
const navigateToNextStage = () => {
  if (hasNextStage.value) {
    pauseTimer();
    currentStageIndex.value++;
    showAllStages.value = true;
  } else if (!showAllStages.value) {
    showAllStages.value = true;
  }
};

// Keyboard event handler
const handleKeyPress = (event: KeyboardEvent) => {
  switch (event.key.toLowerCase()) {
    case ' ':
      event.preventDefault();
      if (!currentStage.value?.hideTimer && showAllStages.value) {
        handleStartPause();
      }
      break;
    case 's':
      if (currentStage.value?.isDualSide && showAllStages.value) {
        event.preventDefault();
        handleSwitchSide();
      }
      break;
    case 'r':
      event.preventDefault();
      if (!currentStage.value?.hideTimer && showAllStages.value) {
        handleReset();
      }
      break;
    case 'arrowleft':
      event.preventDefault();
      navigateToPreviousStage();
      break;
    case 'arrowright':
      event.preventDefault();
      navigateToNextStage();
      break;
  }
};

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  pauseTimer();
});

// Expose navigation functions for external use
defineExpose({
  navigateToPreviousStage,
  navigateToNextStage,
  handleStartPause,
  handleReset,
  handleSwitchSide,
  hasNextStage,
});
</script>

<style scoped>
.timer-display {
  font-family: 'D-DIN', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Roboto Mono', 'monospace';
  /* Use tabular numbers to make digits fixed width */
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.timer-side {
  transition: all 0.3s ease-in-out;
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
