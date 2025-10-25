<template>
  <div class="container mx-auto p-4">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">Activity Management</h1>
        <p class="text-base-content/70 mt-1">Manage your debate activities, participants and debates</p>
      </div>
      <button class="btn btn-primary" @click="createActivity">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Activity
      </button>
    </div>

    <!-- Filters -->
    <div class="card card-border bg-base-100 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <label class="input input-sm">
          <input v-model="filters.search" type="text" placeholder="Search activities..." class="grow" />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </label>

        <select v-model="filters.status" class="select select-sm">
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="ended">Ended</option>
        </select>

        <select v-model="filters.role" class="select select-sm">
          <option value="">All Roles</option>
          <option value="owner">Created by me</option>
          <option value="collaborator">Collaborated by me</option>
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
          Reset
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
        @goto-screen="handleGotoScreen"
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
      <h3 class="text-xl font-semibold mb-2">No activities yet</h3>
      <p class="text-base-content/60 mb-4">Create your first debate activity to get started</p>
      <button class="btn btn-primary" @click="createActivity">Create Activity</button>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <div class="join">
        <button class="join-item btn btn-sm" :disabled="currentPage === 1" @click="currentPage--">«</button>
        <button class="join-item btn btn-sm">Page {{ currentPage }} / {{ totalPages }}</button>
        <button class="join-item btn btn-sm" :disabled="currentPage === totalPages" @click="currentPage++">»</button>
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
      @refresh="loadActivities"
      @switch-debate="switchCurrentDebate"
    />

    <!-- Switch Debate Modal -->
    <dialog id="switch-debate-modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">Switch Debate</h3>
        <div class="space-y-2">
          <button
            v-for="debate in currentActivityDebates"
            :key="debate.id"
            class="btn btn-outline btn-block justify-start"
            :class="{ 'btn-primary': isCurrentDebate(debate.id) }"
            @click="switchToDebate(debate.id)"
          >
            <span class="flex-1 text-left">{{ debate.title }}</span>
            <span v-if="isCurrentDebate(debate.id)" class="badge badge-sm badge-success">Current</span>
          </button>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-sm">Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
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

type ActivitiesResponse = {
  items?: Activity[];
  total_pages?: number;
  data?: {
    items?: Activity[];
    total_pages?: number;
  };
};

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
  status: '',
  role: '',
});

// Computed
const getCurrentDebate = (activityId: string) => {
  return currentDebates.value.get(activityId) || null;
};

const isCurrentDebate = (debateId: string) => {
  return selectedActivity.value && getCurrentDebate(selectedActivity.value.id)?.id === debateId;
};

const loadActivities = async () => {
  loading.value = true;
  try {
    const params = {
      ...filters.value,
      page: currentPage.value,
    };
    const response = await ActivitiesApi.getActivities(params);
    // Support both shapes: { items, total_pages } or { data: { items, total_pages } }
    const resp = response as ActivitiesResponse;
    activities.value = resp.items ?? resp.data?.items ?? [];
    totalPages.value = resp.total_pages ?? resp.data?.total_pages ?? 1;

    // Load debates for each activity
    for (const activity of activities.value) {
      await loadActivityDebates(activity.id);
    }
  } catch {
    toast.error('Failed to load activities');
    // console.error('Failed to load activities:', error);
  } finally {
    loading.value = false;
  }
};

const loadActivityDebates = async (activityId: string) => {
  try {
    const response = await DebatesApi.getDebates(activityId);
    if (response.success && response.data) {
      // response.data might be an array of debates or a paginated object containing items
      type DebatesResponseData = Debate[] | { items?: Debate[] } | { data?: Debate[] };
      const data = response.data as DebatesResponseData;
      let debates: Debate[] = [];

      if (Array.isArray(data)) {
        debates = data;
      } else if ('items' in data && data.items) {
        debates = data.items;
      } else if ('data' in data && data.data) {
        debates = data.data;
      } else {
        debates = [];
      }

      allDebates.value.set(activityId, debates);
      // Find current debate (status = 'ongoing')
      const current = debates.find(d => d.status === 'ongoing');
      if (current) {
        currentDebates.value.set(activityId, current);
      }
    }
  } catch {
    // console.error(`Failed to load debates for activity ${activityId}:`, error);
  }
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
};

const createActivity = () => {
  router.push('/admin/activities/create');
};

const handleViewDetail = (activity: Activity) => {
  router.push(`/admin/activities/${activity.id}`);
};

const handleGotoScreen = (activity: Activity) => {
  router.push(`/screen/${activity.id}`);
};

const handleEdit = (activity: Activity) => {
  router.push(`/admin/activities/${activity.id}/edit`);
};

const handleDelete = async (activity: Activity) => {
  if (!confirm(`Are you sure you want to delete the activity "${activity.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    await ActivitiesApi.deleteActivity(activity.id);
    toast.success('Activity deleted successfully');
    await loadActivities();
  } catch {
    toast.error('Failed to delete activity');
    // console.error('Failed to delete activity:', error);
  }
};

const handleSwitchDebate = async (activity: Activity) => {
  selectedActivity.value = activity;
  currentActivityDebates.value = allDebates.value.get(activity.id) || [];

  if (currentActivityDebates.value.length === 0) {
    toast.warning('This activity has no motions yet');
    return;
  }

  const modal = document.getElementById('switch-debate-modal') as HTMLDialogElement;
  modal?.showModal();
};

const handleManageDebates = async (activity: Activity) => {
  selectedActivity.value = activity;
  const modal = document.getElementById('debate-modal') as HTMLDialogElement;
  modal?.showModal();
};

const handleManageParticipants = async (activity: Activity) => {
  selectedActivity.value = activity;
  const modal = document.getElementById('participant-modal') as HTMLDialogElement;
  modal?.showModal();
};

const handleManageCollaborators = async (activity: Activity) => {
  selectedActivity.value = activity;
  const modal = document.getElementById('collaborator-modal') as HTMLDialogElement;
  modal?.showModal();
};

const switchToDebate = async (debateId: string) => {
  if (!selectedActivity.value) return;

  try {
    const response = await DebatesApi.switchCurrentDebate(selectedActivity.value.id, debateId);
    if (response.success) {
      toast.success('Motion switched successfully');
      await loadActivityDebates(selectedActivity.value.id);
      const modal = document.getElementById('switch-debate-modal') as HTMLDialogElement;
      modal?.close();
    }
  } catch {
    toast.error('Failed to switch motion');
    // console.error('Failed to switch debate:', error);
  }
};

const switchCurrentDebate = async (debateId: string) => {
  await switchToDebate(debateId);
};

// Watch filters
watch(
  () => [filters.value.search, filters.value.status, filters.value.role],
  () => {
    currentPage.value = 1;
    loadActivities();
  },
);

watch(currentPage, () => {
  loadActivities();
});

// Load activities on mount
onMounted(() => {
  loadActivities();
});
</script>
