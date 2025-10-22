# DebateTimer 组件 API 文档

## 概述

`debateTimer.vue` 是辩论计时器组件,提供了完整的辩论赛计时功能,包括多阶段管理、双侧计时、快捷键控制等功能。

## 组件位置

```
frontend/src/components/screen/debateTimer.vue
```

## Props

### timerData

- **类型**: `TimerData | null`
- **必需**: 是
- **说明**: 计时器配置数据,包含所有阶段的配置信息

```typescript
interface TimerData {
  activityName: string; // 活动名称(不在页面上显示)
  debateTitle: string; // 辩题标题
  stages: TimerStage[]; // 计时阶段数组
  timestamp?: string;
}
```

## Events

### timerEnd

- **参数**: `sideIndex: number` - 结束的计时器侧面索引(0或1)
- **说明**: 当某一侧计时器倒计时结束时触发
- **使用示例**:

```vue
<DebateTimer :timer-data="timerData" @timer-end="handleTimerEnd" />
```

## 暴露的方法 (defineExpose)

组件通过 `defineExpose` 暴露了以下方法,可以通过模板引用(ref)来调用:

### navigateToPreviousStage()

导航到上一个阶段

**返回值**: `void`

**说明**: 
- 如果当前不在第一个阶段,则切换到上一个阶段
- 自动暂停当前计时器
- 切换后会进入"显示所有阶段"模式

**使用示例**:

```vue
<template>
  <DebateTimer ref="timerRef" :timer-data="timerData" />
  <button @click="previousStage">上一阶段</button>
</template>

<script setup>
import { ref } from 'vue';

const timerRef = ref(null);

const previousStage = () => {
  if (timerRef.value) {
    timerRef.value.navigateToPreviousStage();
  }
};
</script>
```

### navigateToNextStage()

导航到下一个阶段

**返回值**: `void`

**说明**:
- 如果当前不在最后一个阶段,则切换到下一个阶段
- 如果在初始视图(未显示所有阶段),则切换到"显示所有阶段"模式
- 自动暂停当前计时器

**使用示例**:

```vue
<template>
  <DebateTimer ref="timerRef" :timer-data="timerData" />
  <button @click="nextStage">下一阶段</button>
</template>

<script setup>
import { ref } from 'vue';

const timerRef = ref(null);

const nextStage = () => {
  if (timerRef.value) {
    timerRef.value.navigateToNextStage();
  }
};
</script>
```

### handleStartPause()

开始或暂停当前计时器

**返回值**: `void`

**说明**:
- 如果计时器正在运行,则暂停
- 如果计时器已暂停,则开始/继续计时
- 只在"显示所有阶段"模式且当前阶段未隐藏计时器时有效

**使用示例**:

```vue
<template>
  <DebateTimer ref="timerRef" :timer-data="timerData" />
  <button @click="toggleTimer">开始/暂停</button>
</template>

<script setup>
import { ref } from 'vue';

const timerRef = ref(null);

const toggleTimer = () => {
  if (timerRef.value) {
    timerRef.value.handleStartPause();
  }
};
</script>
```

### handleReset()

重置当前阶段的所有计时器

**返回值**: `void`

**说明**:
- 暂停计时器
- 将所有计时器重置为配置的初始时长
- 重置当前活动的侧面索引为0

**使用示例**:

```vue
<template>
  <DebateTimer ref="timerRef" :timer-data="timerData" />
  <button @click="resetTimer">重置</button>
</template>

<script setup>
import { ref } from 'vue';

const timerRef = ref(null);

const resetTimer = () => {
  if (timerRef.value) {
    timerRef.value.handleReset();
  }
};
</script>
```

### handleSwitchSide()

切换双侧计时器的活动侧面

**返回值**: `void`

**说明**:
- 仅在双侧计时模式(`isDualSide: true`)且计时器正在运行时有效
- 在正方(索引0)和反方(索引1)之间切换
- 计时器保持运行状态

**使用示例**:

```vue
<template>
  <DebateTimer ref="timerRef" :timer-data="timerData" />
  <button @click="switchSide">切换侧面</button>
</template>

<script setup>
import { ref } from 'vue';

const timerRef = ref(null);

const switchSide = () => {
  if (timerRef.value) {
    timerRef.value.handleSwitchSide();
  }
};
</script>
```

## 完整使用示例

```vue
<template>
  <div>
    <!-- 辩论计时器 -->
    <DebateTimer ref="timerRef" :timer-data="timerData" @timer-end="handleTimerEnd" />

    <!-- 外部控制按钮 (可选) -->
    <div class="controls">
      <button @click="previousStage">⬅ 上一阶段</button>
      <button @click="toggleTimer">⏯ 开始/暂停</button>
      <button @click="resetTimer">⟲ 重置</button>
      <button @click="switchSide">⇄ 切换</button>
      <button @click="nextStage">下一阶段 ➡</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DebateTimer from '@/components/screen/debateTimer.vue';
import { ScreenApi } from '@/api/screen';
import type { TimerData } from '@/types/screen';

const timerRef = ref<InstanceType<typeof DebateTimer> | null>(null);
const timerData = ref<TimerData | null>(null);

// 加载计时器数据
onMounted(async () => {
  const activityId = 'your-activity-id';
  try {
    const response = await ScreenApi.getTimerConfig(activityId);
    if (response.success && response.data) {
      timerData.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load timer config:', error);
  }
});

// 计时器结束处理
const handleTimerEnd = (sideIndex: number) => {
  console.log(`计时器侧面 ${sideIndex} 已结束`);
  // 这里可以添加额外的逻辑,如播放音效、发送通知等
};

// 外部控制方法
const previousStage = () => {
  timerRef.value?.navigateToPreviousStage();
};

const nextStage = () => {
  timerRef.value?.navigateToNextStage();
};

const toggleTimer = () => {
  timerRef.value?.handleStartPause();
};

const resetTimer = () => {
  timerRef.value?.handleReset();
};

const switchSide = () => {
  timerRef.value?.handleSwitchSide();
};
</script>
```

## 键盘快捷键

组件内置支持以下键盘快捷键:

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Space` | 开始/暂停 | 仅在"显示所有阶段"模式且计时器未隐藏时有效 |
| `S` | 切换侧面 | 仅在双侧模式且计时器运行时有效 |
| `R` | 重置计时器 | 仅在"显示所有阶段"模式且计时器未隐藏时有效 |
| `←` (左箭头) | 上一阶段 | 等同于调用 `navigateToPreviousStage()` |
| `→` (右箭头) | 下一阶段 | 等同于调用 `navigateToNextStage()` |

## 显示模式

组件有两种显示模式:

### 1. 初始视图模式

- 类似于 Screen 的 Topic 显示
- 只显示辩题和当前阶段名称
- 底部显示页码(第 X / 总数 阶段)
- 提示按右箭头键查看所有阶段

### 2. 所有阶段模式

- 显示完整的计时器界面
- 包含计时器、进度条、控制按钮
- 支持快捷键操作
- 按左/右箭头可在阶段间切换

**切换**: 初始进入时为初始视图模式,按右箭头键或点击"下一阶段"按钮后切换到所有阶段模式

## 功能特性

### 1. 禁止页面滚动

页面使用 `overflow-hidden` 样式,确保内容不会超出屏幕范围。

### 2. 快捷键提示

- 右上角有"快捷键"按钮
- 点击后在按钮下方显示快捷键说明面板
- 再次点击可隐藏

### 3. 阶段导航

- 底部始终显示阶段导航
- 左下角:上一阶段按钮和名称(如果存在)
- 中间:当前阶段页码
- 右下角:下一阶段按钮和名称(如果存在)

### 4. 计时器控制

- 支持单侧和双侧计时
- 自动播放铃声(开始/警告/结束)
- 进度条可视化显示剩余时间
- 时间显示颜色根据剩余比例变化(绿 -> 黄 -> 红)

### 5. 铃声系统

使用 Web Audio API 生成不同频率的提示音:
- 开始: 440Hz
- 警告: 600Hz
- 结束: 800Hz

*注意: 可以替换为实际的音频文件*

## 类型定义

相关类型定义位于 `frontend/src/types/screen.ts`:

```typescript
interface BellTiming {
  time: number; // 在第几秒播放铃声
  type: 'start' | 'warning' | 'end';
}

interface TimerSide {
  name: string; // 发言者名称
  duration: number; // 时长(秒)
  currentTime?: number; // 当前时间(秒)
  isRunning?: boolean; // 是否正在计时
}

interface TimerStage {
  stageName: string; // 阶段名称
  isDualSide: boolean; // 是否为双方计时器
  sides: TimerSide[]; // 计时器侧面(1个或2个)
  bellTimings: BellTiming[]; // 铃声时机配置
  hideTimer?: boolean; // 是否隐藏计时器
}

interface TimerData {
  activityName: string; // 活动名称
  debateTitle: string; // 辩题
  stages: TimerStage[]; // 多个计时器阶段
  timestamp?: string;
}
```

## 注意事项

1. **外部方法调用**: 确保在调用暴露的方法前检查 ref 是否已初始化
2. **计时器状态**: 切换阶段时计时器会自动暂停并重置
3. **双侧模式**: 只有在双侧模式且计时器运行时才能切换侧面
4. **键盘事件**: 组件会监听全局键盘事件,确保不与其他组件冲突
5. **生命周期**: 组件卸载时会自动清理计时器和事件监听器

## 更新日志

### v1.0.0 (2025-10-22)

- ✅ 初始版本
- ✅ 禁止页面滚动
- ✅ 只显示辩题名称(不显示活动名称)
- ✅ 快捷键提示放在右上角按钮,点击后展示
- ✅ 初始视图类似 Screen Topic,按右箭头显示所有阶段
- ✅ 封装左右箭头导航函数,可供外部调用
- ✅ 提供完整的 defineExpose API

---

*文档生成时间: 2025年10月22日*
