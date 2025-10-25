<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <p class="text-base-content/70 mt-1">Overview of your debate activities</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <template v-else>
      <!-- On-going Activities -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">On-going Activities</h3>
        <div v-if="onGoingActivities.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActivityCard
            v-for="activity in onGoingActivities"
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
        <div v-else class="card bg-base-100 shadow-sm">
          <div class="card-body text-center text-base-content/70">
            <p>No ongoing activities</p>
          </div>
        </div>
      </div>

      <!-- Latest Activities -->
      <div>
        <h3 class="text-xl font-semibold mb-4">Latest Activities</h3>
        <div v-if="latestActivities.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActivityCard
            v-for="activity in latestActivities"
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
        <div v-else class="card bg-base-100 shadow-sm">
          <div class="card-body text-center text-base-content/70">
            <p>No recent activities</p>
          </div>
        </div>
      </div>
    </template>

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
import type { Activity, Debate } from '@/types/api';
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
const onGoingActivities = ref<Activity[]>([]);
const latestActivities = ref<Activity[]>([]);
const loading = ref(false);
const selectedActivityId = ref<string>('');
const selectedDebateId = ref<string>('');
const currentActivityDebates = ref<Debate[]>([]);

// Modal refs
const participantModalRef = ref<InstanceType<typeof ParticipantModal> | null>(null);
const collaboratorModalRef = ref<InstanceType<typeof CollaboratorModal> | null>(null);
const debateModalRef = ref<InstanceType<typeof DebateModal> | null>(null);
const timerConfigModalRef = ref<InstanceType<typeof TimerConfigModal> | null>(null);
const switchDebateModalRef = ref<HTMLDialogElement | null>(null);

// Get current debate for an activity
const getCurrentDebate = (activityId: string): Debate | null => {
  if (activityId === selectedActivityId.value) {
    return currentActivityDebates.value.find(d => d.status === 'ongoing') || null;
  }
  return null;
};

// Check if debate is current
const isCurrentDebate = (debateId: string): boolean => {
  return currentActivityDebates.value.some(d => d.id === debateId && d.status === 'ongoing');
};

// Load activities
const loadActivities = async () => {
  try {
    loading.value = true;

    // Load ongoing activities
    const ongoingResponse = await ActivitiesApi.getActivities({
      status: 'ongoing',
      limit: 6,
    });

    if (ongoingResponse && ongoingResponse.items) {
      onGoingActivities.value = ongoingResponse.items;
    }

    // Load latest activities
    const latestResponse = await ActivitiesApi.getActivities({
      limit: 6,
    });

    if (latestResponse && latestResponse.items) {
      latestActivities.value = latestResponse.items;
    }
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number } } | undefined;
    const errorMessage = err?.message || 'Failed to load activities';
    toast.error(errorMessage);

    // If unauthorized, redirect to login
    if (err?.response?.status === 401) {
      router.push('/auth/login?redirect=/admin');
    }
  } finally {
    loading.value = false;
  }
};

const loadActivityDebates = async (activityId: string) => {
  try {
    const response = await DebatesApi.getDebates(activityId);

    if (response && response.success && response.data && response.data.items && Array.isArray(response.data.items)) {
      return response.data.items;
    } else {
      return [];
    }
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } } | undefined;
    if (err?.response?.status !== 403) {
      // Don't show error for 403 (Forbidden)
    }
    return [];
  }
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
  }
};

const handleSwitchDebate = async (activity: Activity) => {
  selectedActivityId.value = activity.id;
  currentActivityDebates.value = await loadActivityDebates(activity.id);

  if (currentActivityDebates.value.length === 0) {
    toast.warning('This activity has no debates yet');
    return;
  }

  await nextTick();
  switchDebateModalRef.value?.showModal();
};

const handleManageDebates = async (activity: Activity) => {
  selectedActivityId.value = activity.id;
  currentActivityDebates.value = await loadActivityDebates(activity.id);
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
