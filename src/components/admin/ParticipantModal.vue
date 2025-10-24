<template>
  <dialog :id="modalId" ref="modalRef" class="modal">
    <div class="modal-box max-w-5xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">Participant Management</h3>
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </form>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 mb-4">
        <button class="btn btn-primary btn-sm" @click="showAddForm = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Participant
        </button>
        <label class="btn btn-outline btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          批量导入
          <input type="file" accept=".xlsx,.xls" class="hidden" @change="handleFileImport" />
        </label>
        <button class="btn btn-outline btn-sm" @click="exportParticipants">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          导出数据
        </button>
        <button class="btn btn-success btn-sm" @click="exportQRCodes" :disabled="exportingQRCodes">
          <span v-if="exportingQRCodes" class="loading loading-spinner loading-xs"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          导出二维码
        </button>
      </div>

      <!-- Add Participant Form -->
      <div v-if="showAddForm" class="card card-border bg-base-200 p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="input">
            <span class="label">姓名</span>
            <input v-model="newParticipant.name" type="text" placeholder="请输入姓名" class="input input-sm" />
          </label>
          <label class="input">
            <span class="label">手机号</span>
            <input v-model="newParticipant.phone" type="text" placeholder="请输入手机号" class="input input-sm" />
          </label>
          <label class="input">
            <span class="label">备注</span>
            <input v-model="newParticipant.note" type="text" placeholder="备注信息" class="input input-sm" />
          </label>
        </div>
        <div class="flex gap-2 mt-4">
          <button class="btn btn-primary btn-sm" :disabled="loading" @click="addParticipant">
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            Save
          </button>
          <button class="btn btn-ghost btn-sm" @click="cancelAdd">Cancel</button>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="flex gap-2 mb-4">
        <label class="input input-sm flex-1">
          <input v-model="searchQuery" type="text" placeholder="Search participants..." class="grow" />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </label>
        <select v-model="statusFilter" class="select select-sm">
          <option value="all">All Status</option>
          <option value="checked_in">Checked In</option>
          <option value="not_checked_in">Not Checked In</option>
        </select>
      </div>

      <!-- Participants Table -->
      <div class="overflow-x-auto">
        <table class="table table-sm table-zebra">
          <thead>
            <tr>
              <th>编号</th>
              <th>姓名</th>
              <th>手机号</th>
              <th>入场状态</th>
              <th>入场时间</th>
              <th>备注</th>
              <th class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-8">
                <span class="loading loading-spinner loading-md"></span>
              </td>
            </tr>
            <tr v-else-if="filteredParticipants.length === 0">
              <td colspan="7" class="text-center py-8 text-base-content/60">No participant data available</td>
            </tr>
            <tr v-for="participant in paginatedParticipants" v-else :key="participant.id">
              <td>{{ participant.code }}</td>
              <td>{{ participant.name || '-' }}</td>
              <td>{{ participant.phone || '-' }}</td>
              <td>
                <span v-if="participant.checkedIn" class="badge badge-success badge-sm">已入场</span>
                <span v-else class="badge badge-ghost badge-sm">未入场</span>
              </td>
              <td>{{ participant.checkedInAt ? formatDate(participant.checkedInAt) : '-' }}</td>
              <td>{{ participant.note || '-' }}</td>
              <td class="text-center">
                <div class="flex justify-center gap-1">
                  <button class="btn btn-ghost btn-xs" @click="editParticipant(participant)">
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
                  <button class="btn btn-ghost btn-xs text-error" @click="deleteParticipant(participant)">
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-4">
        <div class="join">
          <button class="join-item btn btn-sm" :disabled="currentPage === 1" @click="currentPage--">«</button>
          <button class="join-item btn btn-sm">第 {{ currentPage }} / {{ totalPages }} 页</button>
          <button class="join-item btn btn-sm" :disabled="currentPage === totalPages" @click="currentPage++">»</button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats stats-horizontal shadow mt-4 w-full">
        <div class="stat">
          <div class="stat-title">总参与者</div>
          <div class="stat-value text-primary">{{ participants.length }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">已入场</div>
          <div class="stat-value text-success">{{ checkedInCount }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">未入场</div>
          <div class="stat-value">{{ participants.length - checkedInCount }}</div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Participant } from '@/types/api';
import { ParticipantsApi } from '@/api/participants';
import toast from '@/utils/toast';

interface Props {
  activityId: string;
  modalId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modalId: 'participant-modal',
});

const emit = defineEmits<{
  refresh: [];
}>();

// State
const participants = ref<Participant[]>([]);
const loading = ref(false);
const showAddForm = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = 10;
const exportingQRCodes = ref(false);

const newParticipant = ref({
  name: '',
  phone: '',
  note: '',
});

// Computed
const filteredParticipants = computed(() => {
  let result = participants.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      p =>
        p.code?.toLowerCase().includes(query) ||
        p.name?.toLowerCase().includes(query) ||
        p.phone?.toLowerCase().includes(query),
    );
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    result = result.filter(p => {
      if (statusFilter.value === 'checked_in') return p.checkedIn;
      if (statusFilter.value === 'not_checked_in') return !p.checkedIn;
      return true;
    });
  }

  return result;
});

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredParticipants.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredParticipants.value.length / pageSize);
});

const checkedInCount = computed(() => {
  return participants.value.filter(p => p.checkedIn).length;
});

// Methods
const loadParticipants = async () => {
  // console.log(`[ParticipantModal] Loading participants for activity: ${props.activityId}`);
  try {
    loading.value = true;
    const response = await ParticipantsApi.getParticipants(props.activityId, {
      limit: 1000, // Get all participants
    });
    // console.log(`[ParticipantModal] API response:`, response);
    if (response && response.items) {
      participants.value = response.items;
      // console.log(`[ParticipantModal] Loaded ${participants.value.length} participants`);
    }
  } catch {
    // console.error(`[ParticipantModal] Failed to load participants:`, error);
    toast.error('加载参与者列表失败');
    // console.error('Failed to load participants:', error);
  } finally {
    loading.value = false;
  }
};

const addParticipant = async () => {
  if (!newParticipant.value.name) {
    toast.warning('请输入参与者姓名');
    return;
  }

  try {
    loading.value = true;
    const response = await ParticipantsApi.addParticipant(props.activityId, newParticipant.value);
    if (response) {
      toast.success('Participant added successfully');
      await loadParticipants();
      cancelAdd();
      emit('refresh');
    }
  } catch {
    toast.error('Failed to add participant:');
    // console.error('Failed to add participant:', error);
  } finally {
    loading.value = false;
  }
};

const editParticipant = async (participant: Participant) => {
  const newStatus = participant.status === 'active' ? 'inactive' : 'active';
  const action = newStatus === 'active' ? 'activate' : 'deactivate';

  if (!confirm(`Are you sure you want to ${action} participant ${participant.name || participant.code}?`)) {
    return;
  }

  try {
    loading.value = true;
    await ParticipantsApi.updateParticipantStatus(props.activityId, participant.id, newStatus);
    toast.success(`Participant ${action}d successfully`);
    await loadParticipants();
    emit('refresh');
  } catch (error) {
    toast.error(`Failed to ${action} participant`);
    console.error(`Failed to ${action.toLowerCase()} participant:`, error);
  } finally {
    loading.value = false;
  }
};

const deleteParticipant = async (participant: Participant) => {
  if (!confirm(`Are you sure you want to delete participant ${participant.name || participant.code}?`)) {
    return;
  }

  try {
    loading.value = true;
    const response = await ParticipantsApi.deleteParticipant(props.activityId, participant.id);
    if (response !== undefined) {
      toast.success('Participant deleted successfully');
      await loadParticipants();
      emit('refresh');
    }
  } catch (error) {
    toast.error('Failed to delete participant');
    console.error('Failed to delete participant:', error);
  } finally {
    loading.value = false;
  }
};

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('file', file);

    const response = await ParticipantsApi.batchImport(props.activityId, formData);
    toast.success(`Import successful: ${response.success} succeeded, ${response.failed} failed`);
    await loadParticipants();
    emit('refresh');
  } catch (error) {
    toast.error('Batch import failed');
    console.error('Failed to import participants:', error);
  } finally {
    loading.value = false;
    target.value = '';
  }
};

const exportParticipants = async () => {
  try {
    window.open(`/api/activities/${props.activityId}/participants/export`, '_blank');
    toast.success('Export successful');
  } catch (error) {
    toast.error('Export failed');
    console.error('Failed to export participants:', error);
  }
};

const exportQRCodes = async () => {
  if (participants.value.length === 0) {
    toast.warning('没有参与者可以导出');
    return;
  }

  try {
    exportingQRCodes.value = true;
    toast.info('正在生成二维码，请稍候...');

    const blob = await ParticipantsApi.exportQRCodes(props.activityId);

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `participants_qrcode_${props.activityId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('二维码导出成功！');
  } catch (error) {
    toast.error('二维码导出失败');
    console.error('Failed to export QR codes:', error);
  } finally {
    exportingQRCodes.value = false;
  }
};

const cancelAdd = () => {
  showAddForm.value = false;
  newParticipant.value = {
    name: '',
    phone: '',
    note: '',
  };
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Watch for page changes
watch(currentPage, () => {
  // Could add scroll to top here if needed
});

// Watch for activityId changes
watch(
  () => props.activityId,
  (newActivityId: string, oldActivityId: string) => {
    if (newActivityId && newActivityId !== oldActivityId) {
      console.log(
        `[ParticipantModal] Activity changed from ${oldActivityId} to ${newActivityId}, clearing cache and reloading`,
      );
      // Clear current data when switching activities
      participants.value = [];
      currentPage.value = 1;
      searchQuery.value = '';
      statusFilter.value = 'all';
      showAddForm.value = false;
      loadParticipants();
    }
  },
);

// Watch for modal close events
const modalElement = ref<HTMLDialogElement>();
onMounted(() => {
  modalElement.value = document.getElementById(props.modalId) as HTMLDialogElement;
  if (modalElement.value) {
    modalElement.value.addEventListener('close', () => {
      console.log(`[ParticipantModal] Modal closed, clearing form data`);
      // Clear form data when modal closes
      showAddForm.value = false;
      newParticipant.value = {
        name: '',
        phone: '',
        note: '',
      };
    });
  }
});

// Modal ref
const modalRef = ref<HTMLDialogElement | null>(null);

// Modal control methods
const open = () => {
  modalRef.value?.showModal();
  loadParticipants();
};

const close = () => {
  modalRef.value?.close();
  // Reset state on close
  showAddForm.value = false;
  newParticipant.value = { name: '', phone: '', note: '' };
  searchQuery.value = '';
  statusFilter.value = 'all';
  currentPage.value = 1;
};

// Expose methods for parent component
defineExpose({
  loadParticipants,
  open,
  close,
});
</script>
