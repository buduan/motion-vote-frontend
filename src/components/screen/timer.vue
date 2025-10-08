<template>
  <div class="timer">
    <span>{{ formattedTime }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

const props = defineProps({
  duration: {
    type: Number,
    default: 60, // Default duration in seconds
  },
});

const time = ref(props.duration);
const isRunning = ref(false);
const intervalId = ref<number | null>(null);

// 格式化时间显示为 MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(time.value / 60);
  const seconds = time.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// 开始计时器
const start = () => {
  if (isRunning.value || time.value <= 0) return;

  isRunning.value = true;
  intervalId.value = setInterval(() => {
    if (time.value > 0) {
      time.value--;
    } else {
      pause();
    }
  }, 1000);
};

// 暂停计时器
const pause = () => {
  isRunning.value = false;
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// 重置计时器
const reset = () => {
  pause();
  time.value = props.duration;
};

// 向外暴露方法
defineExpose({
  start,
  pause,
  reset,
  isRunning: computed(() => isRunning.value),
  timeLeft: computed(() => time.value),
  formattedTime,
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>

<style>
.timer {
  font-family: 'D-DIN', sans-serif;
  font-weight: bold;
}
</style>
