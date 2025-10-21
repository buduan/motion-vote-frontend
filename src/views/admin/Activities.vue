<template>
  <div class="container mx-auto px-4 mt-8">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">活动列表</h1>
        <p class="text-base-content/70 mt-1">管理您的所有辩论活动</p>
      </div>
      <button class="btn btn-primary" @click="goToCreate">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        创建活动
      </button>
    </div>

    <!-- Filters -->
    <div class="card card-border bg-base-100 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <label class="input input-sm">
          <input v-model="filters.search" type="text" placeholder="搜索活动..." class="grow" @input="debouncedSearch" />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </label>

        <select v-model="filters.status" class="select select-sm" @change="loadActivities">
          <option value="">全部状态</option>
          <option value="upcoming">未开始</option>
          <option value="ongoing">进行中</option>
          <option value="ended">已结束</option>
        </select>

        <select v-model="filters.role" class="select select-sm" @change="loadActivities">
          <option value="">全部角色</option>
          <option value="owner">我创建的</option>
          <option value="collaborator">我协作的</option>
        </select>

        <button class="btn btn-sm btn-outline" @click="resetFilters">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          重置
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Activities Grid -->
    <div v-else-if="activities.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ActivityCard
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
        :current-debate="getCurrentDebate(activity.id)"
        @switch-debate="handleSwitchDebate"
        @manage-debates="handleManageDebates"
        @manage-participants="handleManageParticipants"
        @manage-collaborators="handleManageCollaborators"
        @view-detail="handleViewDetail"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="card card-border bg-base-100 p-12 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto text-base-content/30 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 class="text-xl font-semibold mb-2">暂无活动</h3>
      <p class="text-base-content/60 mb-4">创建您的第一个辩论活动开始使用吧</p>
      <button class="btn btn-primary" @click="goToCreate">创建活动</button>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <div class="join">
        <button class="join-item btn btn-sm" :disabled="currentPage === 1" @click="previousPage">«</button>
        <button class="join-item btn btn-sm">第 {{ currentPage }} / {{ totalPages }} 页</button>
        <button class="join-item btn btn-sm" :disabled="currentPage === totalPages" @click="nextPage">»</button>
      </div>
    </div>

    <!-- Modals -->
    <ParticipantModal
      v-if="selectedActivity"
      ref="participantModal"
      modal-id="participant-modal"
      :activity-id="selectedActivity.id"
      @refresh="loadActivities"
    />

    <CollaboratorModal
      v-if="selectedActivity"
      ref="collaboratorModal"
      modal-id="collaborator-modal"
      :activity-id="selectedActivity.id"
      @refresh="loadActivities"
    />

    <DebateModal
      v-if="selectedActivity"
      ref="debateModal"
      modal-id="debate-modal"
      :activity-id="selectedActivity.id"
      :current-debate="getCurrentDebate(selectedActivity.id)"
      @refresh="handleDebatesRefresh"
    />

    <!-- Switch Debate Modal -->
    <dialog id="switch-debate-modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">切换辩题</h3>
        <div class="space-y-2">
          <button
            v-for="debate in currentActivityDebates"
            :key="debate.id"
            class="btn btn-outline btn-block justify-start"
            :class="{ 'btn-primary': isCurrentDebate(debate.id) }"
            @click="switchToDebate(debate.id)"
          >
            <span class="flex-1 text-left">{{ debate.title }}</span>
            <span v-if="isCurrentDebate(debate.id)" class="badge badge-sm badge-success">当前</span>
          </button>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-sm">关闭</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import type { Activity, Debate, ActivityListParams } from '@/types/api';
import { ActivitiesApi } from '@/api/activities';
import { DebatesApi } from '@/api/debates';
import ActivityCard from '@/components/admin/activityCard.vue';
import ParticipantModal from '@/components/admin/ParticipantModal.vue';
import CollaboratorModal from '@/components/admin/CollaboratorModal.vue';
import DebateModal from '@/components/admin/DebateModal.vue';
import toast from '@/utils/toast';

const router = useRouter();

// State
const activities = ref<Activity[]>([]);
const currentDebates = ref<Map<string, Debate>>(new Map());
const allDebates = ref<Map<string, Debate[]>>(new Map());
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const selectedActivity = ref<Activity | null>(null);
const currentActivityDebates = ref<Debate[]>([]);

// Filters
const filters = ref<ActivityListParams>({
  page: 1,
  limit: 20,
  search: '',
  status: undefined,
  role: undefined,
});

// Debounce timer
let searchTimer: ReturnType<typeof setTimeout> | null = null;

// Computed
const getCurrentDebate = (activityId: string) => {
  return currentDebates.value.get(activityId) || null;
};

const isCurrentDebate = (debateId: string) => {
  return selectedActivity.value && getCurrentDebate(selectedActivity.value.id)?.id === debateId;
};

// Methods
const loadActivities = async () => {
  try {
    loading.value = true;
    const params = {
      ...filters.value,
      page: currentPage.value,
    };

    console.log(`[DEBUG] Loading activities with params:`, params);
    const response = await ActivitiesApi.getActivities(params);
    console.log(`[DEBUG] Activities API response:`, response);
    
    // API returns paginated data directly
    if (response && response.items) {
      activities.value = response.items;
      totalPages.value = response.total_pages || 1;
      console.log(`[DEBUG] Loaded ${activities.value.length} activities, total pages: ${totalPages.value}`);

      // Load debates for each activity
      for (const activity of activities.value) {
        await loadActivityDebates(activity.id);
      }
    } else {
      console.warn(`[DEBUG] Invalid activities response format:`, response);
    }
  } catch (error: any) {
    console.error(`[DEBUG] Error loading activities:`, error);
    const errorMessage = error?.message || '加载活动列表失败';
    toast.error(errorMessage);
    console.error('Failed to load activities:', error);
    
    // If unauthorized, redirect to login
    if (error?.response?.status === 401) {
      router.push('/auth/login?redirect=/admin/activities');
    }
  } finally {
    loading.value = false;
  }
};

const loadActivityDebates = async (activityId: string) => {
  try {
    console.log(`[DEBUG] Loading debates for activity: ${activityId}`);
    const response = await DebatesApi.getDebates(activityId);
    console.log(`[DEBUG] Debates API response for activity ${activityId}:`, response);
    
    // Debates API returns wrapped response {success, message, data: {items: [...], total, page, limit, total_pages}}
    if (response && response.success && response.data && response.data.items && Array.isArray(response.data.items)) {
      allDebates.value.set(activityId, response.data.items);
      // Find current debate (status = 'ongoing')
      const current = response.data.items.find((d) => d.status === 'ongoing');
      console.log(`[DEBUG] Current debate for activity ${activityId}:`, current);
      if (current) {
        currentDebates.value.set(activityId, current);
      }
    } else {
      console.warn(`[DEBUG] Invalid response format for activity ${activityId}:`, response);
    }
  } catch (error: any) {
    console.error(`[DEBUG] Error loading debates for activity ${activityId}:`, error);
    // Don't show error for 403 (Forbidden) - user may not have access to debates
    if (error?.response?.status !== 403) {
      console.error(`Failed to load debates for activity ${activityId}:`, error);
    }
  }
};

const debouncedSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadActivities();
  }, 500);
};

const resetFilters = () => {
  filters.value = {
    page: 1,
    limit: 20,
    search: '',
    status: undefined,
    role: undefined,
  };
  currentPage.value = 1;
  loadActivities();
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadActivities();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadActivities();
  }
};

const goToCreate = () => {
  router.push('/admin/activities/create');
};

const handleViewDetail = (activity: Activity) => {
  router.push(`/admin/activities/${activity.id}`);
};

const handleEdit = (activity: Activity) => {
  router.push(`/admin/activities/${activity.id}/edit`);
};

const handleDelete = async (activity: Activity) => {
  if (!confirm(`确定要删除活动 "${activity.name}" 吗？此操作不可恢复。`)) {
    return;
  }

  try {
    const response = await ActivitiesApi.deleteActivity(activity.id);
    if (response !== undefined) {
      toast.success('删除活动成功');
      await loadActivities();
    }
  } catch (error) {
    toast.error('删除活动失败');
    console.error('Failed to delete activity:', error);
  }
};

const handleSwitchDebate = async (activity: Activity) => {
  selectedActivity.value = activity;
  currentActivityDebates.value = allDebates.value.get(activity.id) || [];

  if (currentActivityDebates.value.length === 0) {
    toast.warning('该活动还没有辩题');
    return;
  }

  const modal = document.getElementById('switch-debate-modal') as HTMLDialogElement;
  modal?.showModal();
};

const handleManageDebates = async (activity: Activity) => {
  selectedActivity.value = activity;
  currentActivityDebates.value = allDebates.value.get(activity.id) || [];
  const modal = document.getElementById('debate-modal') as HTMLDialogElement;
  modal?.showModal();
};

const handleDebatesRefresh = async () => {
  if (selectedActivity.value) {
    await loadActivityDebates(selectedActivity.value.id);
  }
};

const handleManageParticipants = async (activity: Activity) => {
  console.log(`[Activities] Opening participant modal for activity: ${activity.id} (${activity.name})`);
  console.log(`[Activities] Previous selected activity: ${selectedActivity.value?.id} (${selectedActivity.value?.name})`);
  selectedActivity.value = activity;
  console.log(`[Activities] New selected activity set: ${selectedActivity.value.id} (${selectedActivity.value.name})`);
  // Wait for next tick to ensure modal is updated with new activityId
  await nextTick();
  console.log(`[Activities] Modal should now have activityId: ${selectedActivity.value.id}`);
  const modal = document.getElementById('participant-modal') as HTMLDialogElement;
  modal?.showModal();
};

const handleManageCollaborators = async (activity: Activity) => {
  console.log(`[Activities] Opening collaborator modal for activity: ${activity.id} (${activity.name})`);
  console.log(`[Activities] Previous selected activity: ${selectedActivity.value?.id} (${selectedActivity.value?.name})`);
  selectedActivity.value = activity;
  console.log(`[Activities] New selected activity set: ${selectedActivity.value.id} (${selectedActivity.value.name})`);
  // Wait for next tick to ensure modal is updated with new activityId
  await nextTick();
  console.log(`[Activities] Modal should now have activityId: ${selectedActivity.value.id}`);
  const modal = document.getElementById('collaborator-modal') as HTMLDialogElement;
  modal?.showModal();
};

const switchToDebate = async (debateId: string) => {
  if (!selectedActivity.value) return;

  try {
    console.log(`[DEBUG] Switching to debate: ${debateId} for activity: ${selectedActivity.value.id}`);
    const response = await DebatesApi.switchCurrentDebate(selectedActivity.value.id, debateId);
    console.log(`[DEBUG] Switch debate API response:`, response);
    
    if (response && response.success) {
      toast.success('切换辩题成功');
      await loadActivityDebates(selectedActivity.value.id);
      const modal = document.getElementById('switch-debate-modal') as HTMLDialogElement;
      modal?.close();
    }
  } catch (error) {
    console.error(`[DEBUG] Error switching debate:`, error);
    toast.error('切换辩题失败');
  }
};

// Load activities on mount
onMounted(() => {
  loadActivities();
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
