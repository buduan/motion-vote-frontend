<template>
  <div class="rounded-full border-4 border-base-content/30 p-1">
    <div class="rounded-full h-full" :class="voteBarClass" :style="{ width: `${props.percent}%` }"></div>
  </div>
</template>

<script setup lang="ts">
// 投票栏组件
import { computed } from 'vue';

const props = defineProps({
  side: {
    type: String,
    default: 'pro',
  },
  percent: {
    type: Number,
    default: 50,
  },
});

const voteBarClass = computed(() => ({
  'bg-blue-500': props.side === 'pro',
  'bg-red-500': props.side === 'con',
}));
</script>
