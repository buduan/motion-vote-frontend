<template>
  <dialog id="timer-config-modal" ref="modalRef" class="modal">
    <div class="modal-box max-w-7xl h-[90vh] flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold">辩论计时器配置</h3>
        <div class="flex gap-2">
          <div class="tabs tabs-boxed">
            <a class="tab" :class="{ 'tab-active': editMode === 'visual' }" @click="editMode = 'visual'">可视化编辑</a>
            <a class="tab" :class="{ 'tab-active': editMode === 'json' }" @click="editMode = 'json'">JSON源码</a>
          </div>
          <button class="btn btn-sm btn-circle btn-ghost" @click="handleClose">✕</button>
        </div>
      </div>

      <div class="flex-1 overflow-hidden">
        <div v-if="editMode === 'visual'" class="h-full overflow-y-auto pr-2">
          <div class="space-y-4">
            <div v-for="(stage, index) in stages" :key="index" class="card bg-base-200 shadow-sm">
              <div class="card-body p-4">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-bold text-lg">阶段 {{ index + 1 }}</h4>
                  <button class="btn btn-sm btn-error btn-ghost" @click="removeStage(index)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    删除阶段
                  </button>
                </div>

                <div class="form-control mb-3">
                  <label class="label">
                    <span class="label-text font-medium">阶段名称</span>
                  </label>
                  <input
                    v-model="stage.stageName"
                    type="text"
                    placeholder="例如：立论阶段 - 正方"
                    class="input input-bordered"
                  />
                </div>

                <div class="form-control mb-3">
                  <label class="label cursor-pointer justify-start gap-2">
                    <input v-model="stage.isDualSide" type="checkbox" class="checkbox" />
                    <span class="label-text">双边计时（两个计时器交替使用）</span>
                  </label>
                </div>

                <div class="form-control mb-3">
                  <label class="label cursor-pointer justify-start gap-2">
                    <input v-model="stage.hideTimer" type="checkbox" class="checkbox" />
                    <span class="label-text">隐藏计时器（只显示发言者名称）</span>
                  </label>
                </div>

                <div class="divider">发言者配置</div>
                <div class="space-y-3">
                  <div v-for="(side, sideIndex) in stage.sides" :key="sideIndex" class="flex gap-3 items-end">
                    <div class="form-control flex-1">
                      <label class="label">
                        <span class="label-text">
                          {{ stage.isDualSide ? (sideIndex === 0 ? '正方' : '反方') : '发言者' }} 名称
                        </span>
                      </label>
                      <input
                        v-model="side.name"
                        type="text"
                        placeholder="例如：正方一辩"
                        class="input input-bordered input-sm"
                      />
                    </div>
                    <div class="form-control w-32">
                      <label class="label">
                        <span class="label-text">时长（秒）</span>
                      </label>
                      <input
                        v-model.number="side.duration"
                        type="number"
                        min="1"
                        placeholder="180"
                        class="input input-bordered input-sm"
                      />
                    </div>
                    <button
                      v-if="stage.sides.length > 1"
                      class="btn btn-sm btn-ghost btn-error"
                      @click="removeSide(index, sideIndex)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    v-if="!stage.isDualSide || stage.sides.length < 2"
                    class="btn btn-sm btn-outline"
                    @click="addSide(index)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    添加发言者
                  </button>
                </div>

                <div class="divider">响铃配置</div>
                <div class="space-y-3">
                  <div v-for="(bell, bellIndex) in stage.bellTimings" :key="bellIndex" class="flex gap-3 items-end">
                    <div class="form-control flex-1">
                      <label class="label">
                        <span class="label-text">响铃时间（秒）</span>
                      </label>
                      <input
                        v-model.number="bell.time"
                        type="number"
                        min="0"
                        placeholder="从阶段开始计时"
                        class="input input-bordered input-sm"
                      />
                    </div>
                    <div class="form-control w-40">
                      <label class="label">
                        <span class="label-text">铃声类型</span>
                      </label>
                      <select v-model="bell.type" class="select select-bordered select-sm">
                        <option value="start">开始铃</option>
                        <option value="warning">提醒铃</option>
                        <option value="end">结束铃</option>
                      </select>
                    </div>
                    <button class="btn btn-sm btn-ghost btn-error" @click="removeBell(index, bellIndex)">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <button class="btn btn-sm btn-outline" @click="addBell(index)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    添加响铃
                  </button>
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-block" @click="addStage">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              添加新阶段
            </button>
          </div>
        </div>

        <div v-else class="h-full flex flex-col">
          <div class="flex-1 relative">
            <textarea
              v-model="jsonSource"
              class="textarea textarea-bordered w-full h-full font-mono text-sm"
              :class="{ 'textarea-error': jsonError }"
              placeholder="编辑JSON配置..."
              @input="validateJSON"
            ></textarea>
            <div v-if="jsonError" class="text-error text-sm mt-1">
              {{ jsonError }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4 pt-4 border-t">
        <button class="btn btn-ghost" @click="handleClose">取消</button>
        <button class="btn btn-primary" @click="handleSave">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          保存配置
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TimerStage } from '@/types/screen';
import { DebatesApi } from '@/api/debates';
import toast from '@/utils/toast';
import { getDefaultTimerStages } from '@/utils/timerDefaults';

const props = defineProps<{
  debateId: string;
}>();

const emit = defineEmits<{
  save: [];
  close: [];
}>();

const modalRef = ref<HTMLDialogElement | null>(null);
const editMode = ref<'visual' | 'json'>('visual');
const stages = ref<TimerStage[]>([]);
const jsonSource = ref('');
const jsonError = ref('');
const loading = ref(false);

const loadDebateConfig = async () => {
  try {
    loading.value = true;
    const response = await DebatesApi.getDebateById(props.debateId);

    if (response && response.success && response.data) {
      const debateData = response.data as { stages?: TimerStage[] };
      if (debateData.stages && Array.isArray(debateData.stages) && debateData.stages.length > 0) {
        stages.value = debateData.stages;
        syncToJSON();
      } else {
        // 新辩题或没有阶段配置 - 使用模板数据
        // eslint-disable-next-line no-console
        console.log('[Timer Config] Loading default stages from template');
        stages.value = getDefaultTimerStages();
        syncToJSON();
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load debate config:', error);
    toast.error('加载配置失败');
  } finally {
    loading.value = false;
  }
};

const addStage = () => {
  stages.value.push({
    stageName: '新阶段',
    isDualSide: false,
    sides: [{ name: '发言者', duration: 180 }],
    bellTimings: [
      { time: 0, type: 'start' },
      { time: 150, type: 'warning' },
      { time: 180, type: 'end' },
    ],
    hideTimer: false,
  });
  syncToJSON();
};

const removeStage = (index: number) => {
  if (confirm('确定要删除这个阶段吗？')) {
    stages.value.splice(index, 1);
    syncToJSON();
  }
};

const addSide = (stageIndex: number) => {
  const stage = stages.value[stageIndex];
  if (!stage) return;

  if (stage.isDualSide && stage.sides.length >= 2) {
    toast.warning('双边模式最多只能有2个发言者');
    return;
  }

  stage.sides.push({
    name: stage.isDualSide ? (stage.sides.length === 0 ? '正方' : '反方') : '发言者',
    duration: 180,
  });
  syncToJSON();
};

const removeSide = (stageIndex: number, sideIndex: number) => {
  const stage = stages.value[stageIndex];
  if (!stage) return;

  if (stage.sides.length <= 1) {
    toast.warning('至少需要保留一个发言者');
    return;
  }
  stage.sides.splice(sideIndex, 1);
  syncToJSON();
};

const addBell = (stageIndex: number) => {
  const stage = stages.value[stageIndex];
  if (!stage) return;

  stage.bellTimings.push({
    time: 0,
    type: 'warning',
  });
  syncToJSON();
};

const removeBell = (stageIndex: number, bellIndex: number) => {
  const stage = stages.value[stageIndex];
  if (!stage) return;

  stage.bellTimings.splice(bellIndex, 1);
  syncToJSON();
};

const syncToJSON = () => {
  jsonSource.value = JSON.stringify(stages.value, null, 2);
  jsonError.value = '';
};

const syncFromJSON = () => {
  try {
    const parsed = JSON.parse(jsonSource.value);
    if (!Array.isArray(parsed)) {
      throw new Error('配置必须是数组格式');
    }
    stages.value = parsed;
    jsonError.value = '';
  } catch (error) {
    jsonError.value = error instanceof Error ? error.message : '无效的JSON格式';
  }
};

const validateJSON = () => {
  try {
    JSON.parse(jsonSource.value);
    jsonError.value = '';
  } catch (error) {
    if (error instanceof SyntaxError) {
      // 解析错误信息获取位置
      const message = error.message;
      jsonError.value = message;

      // 尝试从错误消息中提取位置信息
      const positionMatch = message.match(/position (\d+)/i);
      const position = positionMatch ? parseInt(positionMatch[1] || '-1', 10) : -1;

      // 计算行号和列号
      let line = 1;
      let column = 1;
      if (position >= 0) {
        const beforeError = jsonSource.value.substring(0, position);
        const lines = beforeError.split('\n');
        line = lines.length;
        const lastLine = lines[lines.length - 1];
        column = (lastLine?.length || 0) + 1;
      }

      // 获取错误上下文（前后各10个字符）
      const contextStart = Math.max(0, position - 10);
      const contextEnd = Math.min(jsonSource.value.length, position + 10);
      const context =
        position >= 0
          ? {
              before: jsonSource.value.substring(contextStart, position),
              after: jsonSource.value.substring(position, contextEnd),
            }
          : null;

      // 输出详细错误信息到控制台
      // eslint-disable-next-line no-console
      console.error('[Timer Config JSON Error]', {
        message: message,
        position: position,
        line: line,
        column: column,
        context: context,
        errorObject: error,
      });
    } else {
      jsonError.value = error instanceof Error ? error.message : '无效的JSON格式';
      // eslint-disable-next-line no-console
      console.error('[Timer Config JSON Error]', error);
    }
  }
};

watch(editMode, newMode => {
  if (newMode === 'json') {
    syncToJSON();
  } else {
    if (!jsonError.value) {
      syncFromJSON();
    }
  }
});

watch(
  stages,
  newStages => {
    newStages.forEach(stage => {
      if (stage.isDualSide) {
        if (stage.sides.length === 1) {
          const firstSide = stage.sides[0];
          stage.sides.push({
            name: '反方',
            duration: firstSide ? firstSide.duration : 180,
          });
        } else if (stage.sides.length > 2) {
          stage.sides = stage.sides.slice(0, 2);
        }
      }
    });
  },
  { deep: true },
);

const handleSave = async () => {
  if (editMode.value === 'json') {
    if (jsonError.value) {
      toast.error('请修正JSON格式错误');
      return;
    }
    syncFromJSON();
  }

  if (stages.value.length === 0) {
    toast.warning('至少需要添加一个阶段');
    return;
  }

  for (const stage of stages.value) {
    if (!stage.stageName.trim()) {
      toast.warning('阶段名称不能为空');
      return;
    }
    if (stage.sides.length === 0) {
      toast.warning('每个阶段至少需要一个发言者');
      return;
    }
    for (const side of stage.sides) {
      if (!side.name.trim()) {
        toast.warning('发言者名称不能为空');
        return;
      }
      if (side.duration <= 0) {
        toast.warning('时长必须大于0');
        return;
      }
    }
  }

  try {
    loading.value = true;

    // 使用专用的 stages 更新接口
    const response = await DebatesApi.updateDebateStages(props.debateId, stages.value);

    if (response && response.success) {
      toast.success('配置保存成功');
      emit('save');
      handleClose();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save config:', error);
    toast.error('保存配置失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('close');
  modalRef.value?.close();
};

const open = () => {
  loadDebateConfig();
  modalRef.value?.showModal();
};

defineExpose({
  open,
});
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.2);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--bc) / 0.3);
}
</style>
