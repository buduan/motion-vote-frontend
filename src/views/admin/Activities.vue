<template>
  <div class="container mx-auto px-4 mt-8">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">Activity List</h1>
        <p class="text-base-content/70 mt-1">Manage all your debate activities</p>
      </div>
      <button class="btn btn-primary" @click="goToCreate">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Activity
      </button>
    </div>

    <!-- Filters -->
    <!-- Search and Filters -->
    <div class="bg-base-100 rounded-lg p-4 mb-6 shadow-sm">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search activities..."
            class="input input-bordered w-full"
            @input="debouncedSearch"
          />
        </div>

        <!-- Status Filter -->
        <div class="w-full md:w-48">
          <select v-model="filters.status" class="select select-bordered w-full">
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        <!-- Role Filter -->
        <div class="w-full md:w-48">
          <select v-model="filters.role" class="select select-bordered w-full">
            <option value="">All Roles</option>
            <option value="creator">Created by me</option>
            <option value="collaborator">Collaborated by me</option>
          </select>
        </div>

        <!-- Reset Button -->
        <button class="btn btn-outline" @click="resetFilters">Reset</button>
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
        @show-in-screen="handleShowInScreen"
        @control="handleControl"
        @setup="handleSetup"
      />
    </div>

    <!-- Empty State -->
    <div v-if="!loading && activities.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">📋</div>
      <h3 class="text-xl font-semibold mb-2">No activities yet</h3>
      <p class="text-base-content/70 mb-6">Create your first debate activity to get started</p>
      <button class="btn btn-primary" @click="goToCreate">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Activity
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <div class="join">
        <button class="join-item btn btn-sm" :disabled="currentPage === 1" @click="previousPage">«</button>
        <button class="join-item btn btn-sm">Page {{ currentPage }} / {{ totalPages }}</button>
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
  status: '',
  role: '',
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
  selectedActivity.value = activity;
  currentActivityDebates.value = allDebates.value.get(activity.id) || [];

  if (currentActivityDebates.value.length === 0) {
    toast.warning('This activity has no debates yet');
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
  // console.log(`[Activities] Opening participant modal for activity: ${activity.id} (${activity.name})`);
  // console.log(
  //   `[Activities] Previous selected activity: ${selectedActivity.value?.id} (${selectedActivity.value?.name})`,
  // );
  selectedActivity.value = activity;
  // console.log(`[Activities] New selected activity set: ${selectedActivity.value.id} (${selectedActivity.value.name})`);
  // Wait for next tick to ensure modal is updated with new activityId
  await nextTick();
  // console.log(`[Activities] Modal should now have activityId: ${selectedActivity.value.id}`);
  const modal = document.getElementById('participant-modal') as HTMLDialogElement;
  modal?.showModal();
};

const handleManageCollaborators = async (activity: Activity) => {
  // console.log(`[Activities] Opening collaborator modal for activity: ${activity.id} (${activity.name})`);
  // console.log(
  //   `[Activities] Previous selected activity: ${selectedActivity.value?.id} (${selectedActivity.value?.name})`,
  // );
  selectedActivity.value = activity;
  // console.log(`[Activities] New selected activity set: ${selectedActivity.value.id} (${selectedActivity.value.name})`);
  // Wait for next tick to ensure modal is updated with new activityId
  await nextTick();
  // console.log(`[Activities] Modal should now have activityId: ${selectedActivity.value.id}`);
  const modal = document.getElementById('collaborator-modal') as HTMLDialogElement;
  modal?.showModal();
};

const switchToDebate = async (debateId: string) => {
  if (!selectedActivity.value) return;

  try {
    // console.log(`[DEBUG] Switching to debate: ${debateId} for activity: ${selectedActivity.value.id}`);
    const response = await DebatesApi.switchCurrentDebate(selectedActivity.value.id, debateId);
    // console.log(`[DEBUG] Switch debate API response:`, response);

    if (response && response.success) {
      toast.success('Debate switched successfully');
      await loadActivityDebates(selectedActivity.value.id);
      const modal = document.getElementById('switch-debate-modal') as HTMLDialogElement;
      modal?.close();
    }
  } catch {
    // console.error(`[DEBUG] Error switching debate:`, error);
    toast.error('Failed to switch debate');
  }
};

const handleSetup = async (activity: Activity) => {
  // Navigate to setup/configuration page for the activity
  router.push(`/admin/activities/${activity.id}/setup`);
};

const handleControl = async (activity: Activity) => {
  // Navigate to control panel for the activity
  router.push(`/admin/activities/${activity.id}/control`);
};

const handleShowInScreen = async (activity: Activity) => {
  // Open activity in screen view
  window.open(`/screen?activity=${activity.id}`, '_blank');
};

// Load activities on mount
onMounted(() => {
  loadActivities();
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
