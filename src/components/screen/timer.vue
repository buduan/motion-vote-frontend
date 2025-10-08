<template>
  <div class="timer">
    <span class="timer-display">{{ formattedTime }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';

const props = defineProps({
  duration: {
    type: Number,
    default: 60, // 默认时长（秒）
  },
});

const emit = defineEmits(['timeup']);

const time = ref(props.duration);
const isRunning = ref(false);
const intervalId = ref<number | null>(null);

// 监听 duration 变化，自动更新时间
watch(
  () => props.duration,
  (newDuration) => {
    if (!isRunning.value) {
      time.value = newDuration;
    }
  }
);

// 格式化时间显示为 MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(time.value / 60);
  const seconds = time.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// 开始或继续计时器
const start = () => {
  if (isRunning.value) return; // 已经在运行中
  
  if (time.value <= 0) {
    time.value = props.duration; // 如果时间已耗尽，重置时间
  }

  isRunning.value = true;
  intervalId.value = window.setInterval(() => {
    if (time.value > 0) {
      time.value--;
      
      // 时间耗尽时触发事件
      if (time.value === 0) {
        pause();
        emit('timeup');
      }
    }
  }, 1000);
};

// 暂停计时器
const pause = () => {
  if (!isRunning.value) return;
  
  isRunning.value = false;
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// 重置计时器到初始时长
const reset = () => {
  pause();
  time.value = props.duration;
};

// 设置自定义时间（秒）
const setTime = (seconds: number) => {
  pause();
  time.value = seconds;
};

// 向外暴露方法和属性
defineExpose({
  start,
  pause,
  reset,
  setTime,
  isRunning: computed(() => isRunning.value),
  timeLeft: computed(() => time.value),
  formattedTime,
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
  }
});
</script>

<style scoped>
.timer {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'D-DIN', sans-serif;
  font-weight: bold;
}

.timer-display {
  font-size: 2rem;
  letter-spacing: 0.05em;
}
</style>
