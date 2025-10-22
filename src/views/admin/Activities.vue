<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">Activity List</h1>
        <p class="text-base-content/70 mt-1">Manage all your debate activities</p>
      </div>
      <button class="btn btn-primary gap-2" @click="handleCreate">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Activity
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card bg-base-100 shadow-sm mb-6">
      <div class="card-body p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="form-control flex-1">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search activities..."
              class="input input-bordered w-full"
              @input="debouncedSearch"
            />
          </div>

          <!-- Status Filter -->
          <div class="form-control w-full md:w-48">
            <select v-model="filters.status" class="select select-bordered w-full">
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          <!-- Role Filter -->
          <div class="form-control w-full md:w-48">
            <select v-model="filters.role" class="select select-bordered w-full">
              <option value="">All Roles</option>
              <option value="creator">Created by me</option>
              <option value="collaborator">Collaborated by me</option>
            </select>
          </div>

          <!-- Reset Button -->
          <button class="btn btn-outline gap-2" @click="resetFilters">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        </div>
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
    <div v-else class="flex flex-col items-center justify-center py-16">
      <div class="text-6xl mb-4">📋</div>
      <h3 class="text-2xl font-bold mb-2">No activities yet</h3>
      <p class="text-base-content/70 mb-6">Create your first debate activity to get started</p>
      <button class="btn btn-primary gap-2" @click="handleCreate">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Activity
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="flex justify-center mt-8">
      <div class="join">
        <button class="join-item btn btn-sm" :disabled="currentPage === 1" @click="previousPage">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="join-item btn btn-sm">Page {{ currentPage }} / {{ totalPages }}</button>
        <button class="join-item btn btn-sm" :disabled="currentPage === totalPages" @click="nextPage">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <ParticipantModal
      v-if="selectedActivityId"
      ref="participantModalRef"
      modal-id="participant-modal"
      :activity-id="selectedActivityId"
      @refresh="loadActivities"
    />

    <CollaboratorModal
      v-if="selectedActivityId"
      ref="collaboratorModalRef"
      modal-id="collaborator-modal"
      :activity-id="selectedActivityId"
      @refresh="loadActivities"
    />

    <DebateModal
      v-if="selectedActivityId"
      ref="debateModalRef"
      modal-id="debate-modal"
      :activity-id="selectedActivityId"
      :current-debate="getCurrentDebate(selectedActivityId)"
      @refresh="handleDebatesRefresh"
      @configure-timer="handleConfigureTimer"
    />

    <TimerConfigModal
      v-if="selectedDebateId"
      ref="timerConfigModalRef"
      :debate-id="selectedDebateId"
      @save="handleTimerConfigSave"
      @close="handleTimerConfigClose"
    />

    <!-- Switch Debate Modal -->
    <dialog id="switch-debate-modal" ref="switchDebateModalRef" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold mb-4">Switch Debate</h3>
        <div class="space-y-2">
          <button
            v-for="debate in currentActivityDebates"
            :key="debate.id"
            class="btn btn-outline btn-block justify-start gap-2"
            :class="{ 'btn-primary': isCurrentDebate(debate.id) }"
            @click="switchToDebate(debate.id)"
          >
            <span class="flex-1 text-left">{{ debate.title }}</span>
            <span v-if="isCurrentDebate(debate.id)" class="badge badge-success badge-sm">Current</span>
          </button>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-sm">Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
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
import TimerConfigModal from '@/components/admin/TimerConfigModal.vue';
import toast from '@/utils/toast';

const router = useRouter();

// State
const activities = ref<Activity[]>([]);
const currentDebates = ref<Map<string, Debate>>(new Map());
const allDebates = ref<Map<string, Debate[]>>(new Map());
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const selectedActivityId = ref<string>('');
const selectedDebateId = ref<string>('');
const currentActivityDebates = ref<Debate[]>([]);

// Modal refs
const participantModalRef = ref<InstanceType<typeof ParticipantModal> | null>(null);
const collaboratorModalRef = ref<InstanceType<typeof CollaboratorModal> | null>(null);
const debateModalRef = ref<InstanceType<typeof DebateModal> | null>(null);
const timerConfigModalRef = ref<InstanceType<typeof TimerConfigModal> | null>(null);
const switchDebateModalRef = ref<HTMLDialogElement | null>(null);

// Filters
const filters = ref<ActivityListParams>({
  page: 1,
  limit: 20,
  search: '',
  status: '',
  role: '',
});

// Debounce timer
let searchTimer: ReturnType<typeof setTimeout> | null = null;

// Get current debate for an activity
const getCurrentDebate = (activityId: string): Debate | null => {
  return currentDebates.value.get(activityId) || null;
};

// Check if debate is current
const isCurrentDebate = (debateId: string): boolean => {
  if (!selectedActivityId.value) return false;
  const currentDebate = getCurrentDebate(selectedActivityId.value);
  return currentDebate?.id === debateId;
};

// Methods
const loadActivities = async () => {
  try {
    loading.value = true;
    const params = {
      ...filters.value,
      page: currentPage.value,
    };

    // console.log(`[DEBUG] Loading activities with params:`, params);
    const response = await ActivitiesApi.getActivities(params);
    // console.log(`[DEBUG] Activities API response:`, response);

    // API returns paginated data directly
    if (response && response.items) {
      activities.value = response.items;
      totalPages.value = response.total_pages || 1;
      // console.log(`[DEBUG] Loaded ${activities.value.length} activities, total pages: ${totalPages.value}`);

      // Load debates for each activity
      for (const activity of activities.value) {
        await loadActivityDebates(activity.id);
      }
    } else {
      // console.warn(`[DEBUG] Invalid activities response format:`, response);
    }
  } catch (error: unknown) {
    // console.error(`[DEBUG] Error loading activities:`, error);
    const err = error as { message?: string; response?: { status?: number } } | undefined;
    const errorMessage = err?.message || 'Failed to load activities';
    toast.error(errorMessage);
    // console.error('Failed to load activities:', error);

    // If unauthorized, redirect to login
    if (err?.response?.status === 401) {
      router.push('/auth/login?redirect=/admin/activities');
    }
  } finally {
    loading.value = false;
  }
};

const loadActivityDebates = async (activityId: string) => {
  try {
    // console.log(`[DEBUG] Loading debates for activity: ${activityId}`);
    const response = await DebatesApi.getDebates(activityId);
    // console.log(`[DEBUG] Debates API response for activity ${activityId}:`, response);

    // Debates API returns wrapped response {success, message, data: {items: [...], total, page, limit, total_pages}}
    if (response && response.success && response.data && response.data.items && Array.isArray(response.data.items)) {
      allDebates.value.set(activityId, response.data.items);
      // Find current debate (status = 'ongoing')
      const current = response.data.items.find(d => d.status === 'ongoing');
      // console.log(`[DEBUG] Current debate for activity ${activityId}:`, current);
      if (current) {
        currentDebates.value.set(activityId, current);
      }
    } else {
      // console.warn(`[DEBUG] Invalid response format for activity ${activityId}:`, response);
    }
  } catch (error: unknown) {
    // console.error(`[DEBUG] Error loading debates for activity ${activityId}:`, error);
    // Don't show error for 403 (Forbidden) - user may not have access to debates
    const err = error as { response?: { status?: number } } | undefined;
    if (err?.response?.status !== 403) {
      // console.error(`Failed to load debates for activity ${activityId}:`, error);
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

const handleCreate = () => {
  router.push('/admin/activities/create');
};

const handleViewDetail = (activity: Activity) => {
  router.push(`/admin/activities/${activity.id}`);
};

const handleEdit = (activity: Activity) => {
  router.push(`/admin/activities/${activity.id}/edit`);
};

const handleDelete = async (activity: Activity) => {
  if (!confirm(`Are you sure you want to delete activity "${activity.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    const response = await ActivitiesApi.deleteActivity(activity.id);
    if (response !== undefined) {
      toast.success('Activity deleted successfully');
      await loadActivities();
    }
  } catch {
    toast.error('Failed to delete activity');
    // console.error('Failed to delete activity:', error);
  }
};

const handleSwitchDebate = async (activity: Activity) => {
  selectedActivityId.value = activity.id;
  currentActivityDebates.value = allDebates.value.get(activity.id) || [];

  if (currentActivityDebates.value.length === 0) {
    toast.warning('This activity has no debates yet');
    return;
  }

  await nextTick();
  switchDebateModalRef.value?.showModal();
};

const handleManageDebates = async (activity: Activity) => {
  selectedActivityId.value = activity.id;
  currentActivityDebates.value = allDebates.value.get(activity.id) || [];
  await nextTick();
  debateModalRef.value?.open();
};

const handleDebatesRefresh = async () => {
  if (selectedActivityId.value) {
    await loadActivityDebates(selectedActivityId.value);
  }
};

const handleManageParticipants = async (activity: Activity) => {
  selectedActivityId.value = activity.id;
  await nextTick();
  participantModalRef.value?.open();
};

const handleManageCollaborators = async (activity: Activity) => {
  selectedActivityId.value = activity.id;
  await nextTick();
  collaboratorModalRef.value?.open();
};

const switchToDebate = async (debateId: string) => {
  if (!selectedActivityId.value) return;

  try {
    const response = await DebatesApi.switchCurrentDebate(selectedActivityId.value, debateId);

    if (response && response.success) {
      toast.success('Debate switched successfully');
      await loadActivityDebates(selectedActivityId.value);
      switchDebateModalRef.value?.close();
    }
  } catch {
    toast.error('Failed to switch debate');
  }
};

// Handle configure timer from DebateModal
const handleConfigureTimer = async (debate: Debate) => {
  selectedDebateId.value = debate.id;
  await nextTick();
  timerConfigModalRef.value?.open();
};

const handleTimerConfigSave = async () => {
  toast.success('Timer configuration saved');
  if (selectedActivityId.value) {
    await loadActivityDebates(selectedActivityId.value);
  }
};

const handleTimerConfigClose = () => {
  selectedDebateId.value = '';
};

// Load activities on mount
onMounted(() => {
  loadActivities();
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
