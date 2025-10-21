<template>
  <dialog :id="modalId" class="modal">
    <div class="modal-box max-w-5xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">辩题管理</h3>
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </form>
      </div>

      <!-- Current Debate Info -->
      <div v-if="currentDebate" class="alert alert-soft alert-success mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <strong>当前辩题：</strong>{{ currentDebate.title }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 mb-4">
        <button class="btn btn-primary btn-sm" @click="showCreateForm = !showCreateForm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          创建辩题
        </button>
      </div>

      <!-- Create/Edit Form -->
      <div v-if="showCreateForm" class="card card-border bg-base-200 p-4 mb-4">
        <h4 class="font-semibold mb-3">{{ editingDebate ? '编辑辩题' : '创建辩题' }}</h4>
        <div class="space-y-4">
          <label class="input">
            <span class="label">辩题标题 *</span>
            <input v-model="debateForm.title" type="text" placeholder="请输入辩题标题" class="input input-sm" />
          </label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="floating-label">
              <textarea v-model="debateForm.proDescription" class="textarea" rows="3" placeholder=" "></textarea>
              <span>正方观点 *</span>
            </label>

            <label class="floating-label">
              <textarea v-model="debateForm.conDescription" class="textarea" rows="3" placeholder=" "></textarea>
              <span>反方观点 *</span>
            </label>
          </div>

          <label class="floating-label">
            <textarea v-model="debateForm.background" class="textarea" rows="3" placeholder=" "></textarea>
            <span>辩题背景</span>
          </label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="input">
              <span class="label">预计时长（分钟）</span>
              <input
                v-model.number="debateForm.estimatedDuration"
                type="number"
                placeholder="30"
                class="input input-sm"
              />
            </label>

            <label class="input">
              <span class="label">排序号</span>
              <input v-model.number="debateForm.order" type="number" placeholder="1" class="input input-sm" />
            </label>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-primary btn-sm" :disabled="loading" @click="saveDebate">
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            {{ editingDebate ? '更新' : '创建' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="cancelForm">取消</button>
        </div>
      </div>

      <!-- Debates Table -->
      <div class="overflow-x-auto">
        <table class="table table-sm table-zebra">
          <thead>
            <tr>
              <th>排序</th>
              <th>辩题标题</th>
              <th>状态</th>
              <th>正方</th>
              <th>反方</th>
              <th>时长</th>
              <th class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-8">
                <span class="loading loading-spinner loading-md"></span>
              </td>
            </tr>
            <tr v-else-if="debates.length === 0">
              <td colspan="7" class="text-center py-8 text-base-content/60">暂无辩题</td>
            </tr>
            <tr v-for="debate in sortedDebates" v-else :key="debate.id" :class="{ 'bg-base-200': isCurrentDebate(debate) }">
              <td>{{ debate.order }}</td>
              <td>
                <div class="font-medium">{{ debate.title }}</div>
                <div v-if="isCurrentDebate(debate)" class="badge badge-success badge-xs mt-1">当前辩题</div>
              </td>
              <td>
                <span :class="getStatusBadgeClass(debate.status)">{{ getStatusText(debate.status) }}</span>
              </td>
              <td class="max-w-xs truncate">{{ debate.proDescription }}</td>
              <td class="max-w-xs truncate">{{ debate.conDescription }}</td>
              <td>{{ debate.estimatedDuration || '-' }} 分钟</td>
              <td class="text-center">
                <div class="flex justify-center gap-1">
                  <button
                    v-if="!isCurrentDebate(debate)"
                    class="btn btn-ghost btn-xs tooltip"
                    data-tip="切换到此辩题"
                    @click="switchToDebate(debate)"
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
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </button>
                  <button class="btn btn-ghost btn-xs" @click="editDebate(debate)">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button class="btn btn-ghost btn-xs text-error" @click="deleteDebate(debate)">
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Statistics -->
      <div class="stats stats-horizontal shadow mt-4 w-full">
        <div class="stat">
          <div class="stat-title">总辩题数</div>
          <div class="stat-value text-primary">{{ debates.length }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">进行中</div>
          <div class="stat-value text-success">{{ ongoingCount }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">待开始</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Debate, CreateDebateRequest } from '@/types/api';
import { DebatesApi } from '@/api/debates';
import toast from '@/utils/toast';

interface Props {
  activityId: string;
  currentDebate?: Debate | null;
  modalId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modalId: 'debate-modal',
});

const emit = defineEmits<{
  refresh: [];
  'switch-debate': [debateId: string];
}>();

// State
const debates = ref<Debate[]>([]);
const loading = ref(false);
const showCreateForm = ref(false);
const editingDebate = ref<Debate | null>(null);

const debateForm = ref<CreateDebateRequest>({
  title: '',
  proDescription: '',
  conDescription: '',
  background: '',
  estimatedDuration: undefined,
  order: undefined,
});

// Computed
const sortedDebates = computed(() => {
  return [...debates.value].sort((a, b) => (a.order || 0) - (b.order || 0));
});

const ongoingCount = computed(() => {
  return debates.value.filter((d) => d.status === 'ongoing').length;
});

const pendingCount = computed(() => {
  return debates.value.filter((d) => d.status === 'pending').length;
});

// Methods
const loadDebates = async () => {
  try {
    loading.value = true;
    console.log(`[DEBUG] Loading debates for activity: ${props.activityId}`);
    const response = await DebatesApi.getDebates(props.activityId);
    console.log(`[DEBUG] DebateModal debates API response:`, response);
    
    // Debates API returns wrapped response {success, message, data: {items: [...], total, page, limit, total_pages}}
    if (response && response.success && response.data && response.data.items && Array.isArray(response.data.items)) {
      debates.value = response.data.items;
      console.log(`[DEBUG] Loaded ${debates.value.length} debates`);
    } else {
      console.warn(`[DEBUG] Invalid debates response format:`, response);
      debates.value = []; // Set empty array to prevent iteration errors
    }
  } catch (error: any) {
    console.error(`[DEBUG] Error loading debates in modal:`, error);
    // Handle different error types
    if (error?.response?.status === 403) {
      toast.error('您没有权限访问此活动的辩题');
      debates.value = []; // Set empty array to prevent iteration errors
    } else {
      toast.error('加载辩题列表失败');
      console.error('Failed to load debates:', error);
      debates.value = []; // Set empty array to prevent iteration errors
    }
  } finally {
    loading.value = false;
  }
};

const saveDebate = async () => {
  if (!debateForm.value.title) {
    toast.warning('请输入辩题标题');
    return;
  }

  if (!debateForm.value.proDescription) {
    toast.warning('请输入正方观点');
    return;
  }

  if (!debateForm.value.conDescription) {
    toast.warning('请输入反方观点');
    return;
  }

  try {
    loading.value = true;

    if (editingDebate.value) {
      const response = await DebatesApi.updateDebate(editingDebate.value.id, debateForm.value);
      
      if (response && response.success) {
        toast.success('更新辩题成功');
        await loadDebates();
        cancelForm();
        emit('refresh');
      }
    } else {
      const response = await DebatesApi.createDebate(props.activityId, debateForm.value);
      
      if (response && response.success) {
        toast.success('创建辩题成功');
        await loadDebates();
        cancelForm();
        emit('refresh');
      }
    }
  } catch (error) {
    console.error(`[DEBUG] Error saving debate:`, error);
    toast.error(editingDebate.value ? '更新辩题失败' : '创建辩题失败');
    console.error('Failed to save debate:', error);
  } finally {
    loading.value = false;
  }
};

const editDebate = (debate: Debate) => {
  editingDebate.value = debate;
  debateForm.value = {
    title: debate.title,
    proDescription: debate.proDescription,
    conDescription: debate.conDescription,
    background: debate.background,
    estimatedDuration: debate.estimatedDuration,
    order: debate.order,
  };
  showCreateForm.value = true;
};

const deleteDebate = async (debate: Debate) => {
  if (!confirm(`确定要删除辩题 "${debate.title}" 吗？`)) {
    return;
  }

  try {
    loading.value = true;
    const response = await DebatesApi.deleteDebate(debate.id);
    
    if (response && response.success) {
      toast.success('删除辩题成功');
      await loadDebates();
      emit('refresh');
    }
  } catch (error) {
    toast.error('删除辩题失败');
    console.error('Failed to delete debate:', error);
  } finally {
    loading.value = false;
  }
};

const switchToDebate = async (debate: Debate) => {
  if (isCurrentDebate(debate)) {
    toast.info('该辩题已是当前辩题');
    return;
  }

  try {
    loading.value = true;
    const response = await DebatesApi.switchCurrentDebate(props.activityId, debate.id);
    
    if (response && response.success) {
      toast.success('切换辩题成功');
      await loadDebates();
      emit('refresh');
    }
  } catch (error) {
    console.error(`[DEBUG] Error switching current debate:`, error);
    toast.error('切换辩题失败');
    console.error('Failed to switch debate:', error);
  } finally {
    loading.value = false;
  }
};

const cancelForm = () => {
  showCreateForm.value = false;
  editingDebate.value = null;
  debateForm.value = {
    title: '',
    proDescription: '',
    conDescription: '',
    background: '',
    estimatedDuration: undefined,
    order: undefined,
  };
};

const isCurrentDebate = (debate: Debate) => {
  return props.currentDebate?.id === debate.id;
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待开始',
    ongoing: '进行中',
    final_vote: '最终投票',
    ended: '已结束',
  };
  return map[status] || status;
};

const getStatusBadgeClass = (status: string) => {
  const baseClass = 'badge badge-sm';
  switch (status) {
    case 'ongoing':
      return `${baseClass} badge-success`;
    case 'final_vote':
      return `${baseClass} badge-warning`;
    case 'ended':
      return `${baseClass} badge-neutral`;
    case 'pending':
    default:
      return `${baseClass} badge-ghost`;
  }
};

// Load debates when mounted
onMounted(() => {
  loadDebates();
});

// Expose methods for parent component
defineExpose({
  loadDebates,
});
</script>
