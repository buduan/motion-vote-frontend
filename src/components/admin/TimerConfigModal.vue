<!--
  TODO: Timer Configuration Modal Component
  
  功能需求:
  1. 支持可视化编辑计时配置
     - 通过添加/删除卡片的方式管理阶段
     - 每个阶段可配置:
       * 阶段名称 (stageName)
       * 是否双侧计时 (isDualSide)
       * 发言者配置 (sides)
         - 发言者名称 (name)
         - 时长/秒 (duration)
       * 铃声配置 (bellTimings)
         - 响铃时间/秒 (time)
         - 铃声类型 (type: 'start' | 'warning' | 'end')
       * 是否隐藏计时器 (hideTimer, optional)
  
  2. 支持 JSON 源码编辑
     - 提供代码编辑器直接修改JSON
     - JSON 格式验证
     - 可在可视化和源码模式间切换
  
  3. 数据接口 (待后端确认)
     - TODO: 确认接口路径和字段名
     - 保存到 debate 或 activity 的哪个字段
  
  类型定义参考: frontend/src/types/screen.ts
  - TimerData
  - TimerStage
  - TimerSide
  - BellTiming
  
  API 文档参考: backend/DebateTimer_API_Demo.md
-->

<template>
  <dialog id="timer-config-modal" class="modal">
    <div class="modal-box max-w-6xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">计时配置</h3>
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </form>
      </div>

      <!-- TODO: 实现可视化编辑和JSON源码编辑功能 -->
      <div class="text-center py-12 text-gray-400">
        <p class="text-xl mb-2">此组件开发中...</p>
        <p>请参考组件头部注释了解功能需求</p>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TimerData } from '@/types/screen';

// TODO: 实现组件逻辑

const props = defineProps<{
  debateId: string;
}>();

const emit = defineEmits<{
  save: [config: TimerData];
}>();

// TODO: 添加状态管理
const timerConfig = ref<TimerData | null>(null);
const editMode = ref<'visual' | 'json'>('visual');
</script>

<style scoped>
/* TODO: 添加样式 */
</style>
