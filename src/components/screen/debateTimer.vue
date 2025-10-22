<template>
  <div class="p-16 flex flex-col h-screen items-start justify-start relative">
    <!-- Debate Topic Header -->
    <div class="w-full mt-4 mb-8">
      <h3 class="text-4xl/[1.5] font-bold mb-4">
        {{ timerData?.activityName || '加载中...' }}
      </h3>
      <h1 class="text-9xl/[1.5] font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
        {{ timerData?.debateTitle || '等待辩题...' }}
      </h1>
    </div>

    <!-- Current Stage Name -->
    <div v-if="currentStage" class="w-full mb-6">
      <h2 class="text-5xl font-bold text-center text-gray-300">
        {{ currentStage.stageName }}
      </h2>
    </div>

    <!-- Timer Display Area -->
    <div v-if="currentStage" class="w-full flex-1 flex" :class="currentStage.isDualSide ? 'justify-between gap-8' : 'justify-center items-center'">
      <!-- Single Timer or Left Timer (Pro Side) -->
      <div 
        v-if="currentStage.sides && currentStage.sides.length > 0"
        class="timer-side flex-1 flex flex-col"
        :class="currentStage.isDualSide ? '' : 'max-w-2xl'"
      >
        <!-- Speaker Name (Centered) -->
        <div class="w-full text-center mb-6">
          <h2 class="text-8xl/[1.5] font-black" 
              :class="currentSideIndex === 0 && isTimerRunning ? 'text-blue-500' : 'text-gray-500'">
            {{ currentStage.sides[0]?.name || '发言者' }}
          </h2>
        </div>
        
        <!-- Timer Display (Centered) - Only if hideTimer is false -->
        <div v-if="!currentStage.hideTimer" class="w-full flex flex-col items-center">
          <div class="timer-display font-number text-9xl/[1.5] font-bold mb-4" :class="getTimeColor(0)">
            {{ formatTime(sideTimers[0] ?? 0) }}
          </div>
          <!-- Progress Bar -->
          <div class="w-full rounded-full border-4 border-base-content/30 p-1 h-16">
            <div 
              class="rounded-full h-full transition-all duration-300"
              :class="currentSideIndex === 0 && isTimerRunning ? 'bg-blue-500' : 'bg-gray-500'"
              :style="{ width: `${getProgressPercent(0)}%` }"
            ></div>
          </div>
          <p class="text-2xl mt-2 text-gray-500">
            总时长: {{ formatTime(currentStage.sides[0]?.duration ?? 0) }}
          </p>
        </div>
      </div>

      <!-- Right Timer (Con Side - Dual Side Only) -->
      <div 
        v-if="currentStage.isDualSide && currentStage.sides.length > 1"
        class="timer-side flex-1 flex flex-col"
      >
        <!-- Speaker Name (Centered) -->
        <div class="w-full text-center mb-6">
          <h2 class="text-8xl/[1.5] font-black" 
              :class="currentSideIndex === 1 && isTimerRunning ? 'text-red-500' : 'text-gray-500'">
            {{ currentStage.sides[1]?.name || '发言者' }}
          </h2>
        </div>
        
        <!-- Timer Display (Centered) - Only if hideTimer is false -->
        <div v-if="!currentStage.hideTimer" class="w-full flex flex-col items-center">
          <div class="timer-display font-number text-9xl/[1.5] font-bold mb-4" :class="getTimeColor(1)">
            {{ formatTime(sideTimers[1] ?? 0) }}
          </div>
          <!-- Progress Bar -->
          <div class="w-full rounded-full border-4 border-base-content/30 p-1 h-16">
            <div 
              class="rounded-full h-full transition-all duration-300"
              :class="currentSideIndex === 1 && isTimerRunning ? 'bg-red-500' : 'bg-gray-500'"
              :style="{ width: `${getProgressPercent(1)}%` }"
            ></div>
          </div>
          <p class="text-2xl mt-2 text-gray-500">
            总时长: {{ formatTime(currentStage.sides[1]?.duration ?? 0) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Control Panel -->
    <div v-if="currentStage && !currentStage.hideTimer" class="w-full mt-8">
      <div class="flex justify-center gap-6 mb-4">
        <button 
          @click="handleStartPause"
          class="btn btn-lg px-8"
          :class="isTimerRunning ? 'btn-warning' : 'btn-primary'"
        >
          {{ isTimerRunning ? '⏸ 暂停' : '▶ 开始' }}
        </button>
        
        <button 
          v-if="currentStage.isDualSide"
          @click="handleSwitchSide"
          class="btn btn-lg btn-secondary px-8"
          :disabled="!isTimerRunning"
        >
          🔄 切换
        </button>
        
        <button 
          @click="handleReset"
          class="btn btn-lg btn-ghost px-8"
        >
          ⟲ 重置
        </button>
      </div>
      
      <!-- Keyboard Hints -->
      <div class="text-center">
        <p class="text-xl text-gray-400">
          快捷键: <span class="kbd kbd-sm">Space</span> 开始/暂停 
          <span v-if="currentStage.isDualSide">| <span class="kbd kbd-sm">S</span> 切换</span>
          | <span class="kbd kbd-sm">R</span> 重置
          | <span class="kbd kbd-sm">←</span> 上一阶段
          | <span class="kbd kbd-sm">→</span> 下一阶段
        </p>
      </div>
    </div>

    <!-- Stage Navigation - Bottom Corners -->
    <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
      <!-- Previous Stage -->
      <div v-if="hasPreviousStage" class="flex flex-col items-start pointer-events-auto">
        <button 
          @click="previousStage"
          class="btn btn-ghost btn-sm mb-2 opacity-70 hover:opacity-100"
        >
          ← 上一阶段
        </button>
        <p class="text-lg text-gray-500 max-w-xs truncate">
          {{ previousStageName }}
        </p>
      </div>
      <div v-else class="w-1"></div>

      <!-- Stage Indicator -->
      <div class="text-center pointer-events-auto">
        <p class="text-xl text-gray-400">
          {{ currentStageIndex + 1 }} / {{ totalStages }}
        </p>
      </div>

      <!-- Next Stage -->
      <div v-if="hasNextStage" class="flex flex-col items-end pointer-events-auto">
        <button 
          @click="nextStage"
          class="btn btn-ghost btn-sm mb-2 opacity-70 hover:opacity-100"
        >
          下一阶段 →
        </button>
        <p class="text-lg text-gray-500 max-w-xs truncate text-right">
          {{ nextStageName }}
        </p>
      </div>
      <div v-else class="w-1"></div>
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
const currentStageIndex = ref(0); // 当前阶段索引
const currentSideIndex = ref(0); // 当前活动的计时器索引
const isTimerRunning = ref(false);
const sideTimers = ref<number[]>([]); // 每个侧面的剩余时间（秒）
const intervalId = ref<number | null>(null);

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
watch([() => props.timerData, currentStageIndex], ([newData]) => {
  if (newData && currentStage.value?.sides) {
    sideTimers.value = currentStage.value.sides.map(side => side.currentTime ?? side.duration);
    currentSideIndex.value = 0;
    isTimerRunning.value = false;
    pauseTimer(); // 确保停止之前的计时器
  }
}, { immediate: true });

// Format time as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get time color based on remaining time
const getTimeColor = (sideIndex: number): string => {
  if (!currentStage.value?.sides[sideIndex]) return 'text-gray-400';
  
  const remaining = sideTimers.value[sideIndex];
  if (remaining === undefined) return 'text-gray-400';
  
  const duration = currentStage.value.sides[sideIndex].duration;
  const percentage = (remaining / duration) * 100;
  
  if (percentage > 50) return 'text-green-400';
  if (percentage > 20) return 'text-yellow-400';
  return 'text-red-400';
};

// Get progress percentage for progress bar
const getProgressPercent = (sideIndex: number): number => {
  if (!currentStage.value?.sides[sideIndex]) return 0;
  
  const remaining = sideTimers.value[sideIndex];
  if (remaining === undefined) return 0;
  
  const duration = currentStage.value.sides[sideIndex].duration;
  return (remaining / duration) * 100;
};

// Check and play bell if needed
const checkAndPlayBell = (elapsedTime: number) => {
  if (!currentStage.value?.bellTimings) return;
  
  currentStage.value.bellTimings.forEach(bell => {
    if (bell.time === elapsedTime) {
      playBell(bell.type);
    }
  });
};

// Play bell sound (placeholder - will be replaced with actual audio file)
const playBell = (type: 'start' | 'warning' | 'end') => {
  // TODO: Implement actual bell audio playback
  console.log(`🔔 Bell: ${type}`);
  
  // Use Web Audio API to create a simple beep
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Different frequencies for different bell types
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

// Start the timer
const startTimer = () => {
  if (!currentStage.value?.sides) return;
  
  isTimerRunning.value = true;
  
  intervalId.value = window.setInterval(() => {
    if (!currentStage.value?.sides) return;
    
    const currentTimer = sideTimers.value[currentSideIndex.value];
    
    if (currentTimer !== undefined && currentTimer > 0) {
      sideTimers.value[currentSideIndex.value] = currentTimer - 1;
      
      // Check for bell timing
      const side = currentStage.value.sides[currentSideIndex.value];
      if (side) {
        const elapsed = side.duration - sideTimers.value[currentSideIndex.value]!;
        checkAndPlayBell(elapsed);
      }
      
      // Check if time is up
      if (sideTimers.value[currentSideIndex.value] === 0) {
        playBell('end');
        emit('timerEnd', currentSideIndex.value);
        
        // In dual-side mode, auto switch to other side if available
        if (currentStage.value?.isDualSide && currentStage.value.sides.length > 1) {
          const otherSideIndex = currentSideIndex.value === 0 ? 1 : 0;
          const otherTimer = sideTimers.value[otherSideIndex];
          if (otherTimer !== undefined && otherTimer > 0) {
            // Don't auto-switch, just pause
            pauseTimer();
          } else {
            pauseTimer();
          }
        } else {
          pauseTimer();
        }
      }
    }
  }, 1000);
};

// Pause the timer
const pauseTimer = () => {
  isTimerRunning.value = false;
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// Switch to the other side (dual-side only)
const handleSwitchSide = () => {
  if (!currentStage.value?.isDualSide || !currentStage.value.sides || currentStage.value.sides.length < 2) return;
  
  // Switch to the other side
  currentSideIndex.value = currentSideIndex.value === 0 ? 1 : 0;
  
  // If timer was running, keep it running on the new side
  if (isTimerRunning.value) {
    // No need to restart, the interval will continue with new currentSideIndex
  }
};

// Reset all timers
const handleReset = () => {
  pauseTimer();
  
  if (currentStage.value?.sides) {
    sideTimers.value = currentStage.value.sides.map(side => side.duration);
  }
  
  currentSideIndex.value = 0;
};

// Stage navigation
const previousStage = () => {
  if (hasPreviousStage.value) {
    pauseTimer();
    currentStageIndex.value--;
  }
};

const nextStage = () => {
  if (hasNextStage.value) {
    pauseTimer();
    currentStageIndex.value++;
  }
};

// Keyboard event handler
const handleKeyPress = (event: KeyboardEvent) => {
  // Prevent default for our hotkeys
  switch (event.key.toLowerCase()) {
    case ' ': // Space
      event.preventDefault();
      if (!currentStage.value?.hideTimer) {
        handleStartPause();
      }
      break;
    case 's': // Switch
      if (currentStage.value?.isDualSide && isTimerRunning.value) {
        event.preventDefault();
        handleSwitchSide();
      }
      break;
    case 'r': // Reset
      event.preventDefault();
      if (!currentStage.value?.hideTimer) {
        handleReset();
      }
      break;
    case 'arrowleft': // Previous stage
      event.preventDefault();
      previousStage();
      break;
    case 'arrowright': // Next stage
      event.preventDefault();
      nextStage();
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
</script>

<style scoped>
.timer-display {
  font-family: 'D-DIN', 'Arial', sans-serif;
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
</style>
