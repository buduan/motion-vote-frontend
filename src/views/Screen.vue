<template>
  <!-- Selector -->
  <Transition name="fade">
    <div v-if="showSelector" class="absolute top-4 right-4">
      <div class="selector">
        <select v-model="selectedOption" class="select">
          <option value="topic">Topic</option>
          <option value="pros">Pros</option>
          <option value="cons">Cons</option>
          <option value="both">Both</option>
        </select>
      </div>
    </div>
  </Transition>
  <!-- Logo -->
  <div class="absolute top-4 left-4 h-16 w-auto">
    <img src="@/assets/logo.jpg" alt="Logo" class="w-16 h-16" />
  </div>

  <div
    class="p-12 flex flex-col h-screen"
    :class="{
      'items-center align-center text-center': selectedOption === 'topic',
      'items-start': selectedOption === 'pros' || selectedOption === 'cons' || selectedOption === 'both',
      'justify-center': selectedOption === 'topic',
      'justify-start': selectedOption === 'pros' || selectedOption === 'cons' || selectedOption === 'both',
    }"
  >
    <!-- Debate Topic -->
    <div class="w-full" :class="{ 'h-3/5 overflow-hidden': selectedOption !== 'topic' }">
      <h3 v-if="selectedOption === 'topic'" class="text-4xl/[1.5] font-bold mb-4">这里是活动名称</h3>
      <h1
        class="text-9xl/[1.5] font-black mb-4"
        :class="
          selectedOption === 'topic'
            ? ' bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent'
            : ''
        "
      >
        电影解说丰富/消解了艺术价值
      </h1>
    </div>

    <!-- Vote -->
    <div v-if="selectedOption !== 'topic'" class="w-full flex justify-between">
      <h2 class="text-8xl/[1.5] font-black mb-4">正方</h2>
      <h2 class="text-8xl/[1.5] font-bold mb-4 text-blue-500 font-number">90.0%</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
// 大屏展示页面
import { ref, watch } from 'vue';
import { useMouse } from '@vueuse/core';

const selectedOption = ref('topic');
const showSelector = ref(false);

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
</style>
