<template>
  <dialog :id="modalId" ref="modalRef" class="modal">
    <div class="modal-box max-w-4xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">协作者管理</h3>
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </form>
      </div>

      <!-- Invite/Edit Collaborator Form -->
      <div v-if="showInviteForm || editingCollaborator" class="card card-border bg-base-200 p-4 mb-4">
        <h4 class="font-semibold mb-3">{{ editingCollaborator ? '编辑协作者权限' : '邀请协作者' }}</h4>
        <div v-if="!editingCollaborator" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="input">
            <span class="label">邮箱</span>
            <input v-model="newCollaborator.email" type="email" placeholder="请输入邮箱" class="input input-sm" />
          </label>
          <div>
            <span class="label">权限</span>
            <div class="flex flex-wrap gap-2">
              <label class="label cursor-pointer gap-2">
                <input
                  v-model="newCollaborator.permissions"
                  type="checkbox"
                  value="view"
                  class="checkbox checkbox-sm"
                />
                <span class="label-text">查看</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input
                  v-model="newCollaborator.permissions"
                  type="checkbox"
                  value="edit"
                  class="checkbox checkbox-sm"
                />
                <span class="label-text">编辑</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input
                  v-model="newCollaborator.permissions"
                  type="checkbox"
                  value="control"
                  class="checkbox checkbox-sm"
                />
                <span class="label-text">控制</span>
              </label>
            </div>
          </div>
        </div>
        <div v-else class="grid grid-cols-1 gap-4">
          <div>
            <span class="label">
              协作者：{{ editingCollaborator.user.name }} ({{ editingCollaborator.user.email }})
            </span>
            <div class="flex flex-wrap gap-2 mt-2">
              <label class="label cursor-pointer gap-2">
                <input v-model="editingPermissions" type="checkbox" value="view" class="checkbox checkbox-sm" />
                <span class="label-text">查看</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input v-model="editingPermissions" type="checkbox" value="edit" class="checkbox checkbox-sm" />
                <span class="label-text">编辑</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input v-model="editingPermissions" type="checkbox" value="control" class="checkbox checkbox-sm" />
                <span class="label-text">控制</span>
              </label>
            </div>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button
            class="btn btn-primary btn-sm"
            :disabled="loading"
            @click="editingCollaborator ? updateCollaboratorPermissions() : inviteCollaborator()"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            {{ editingCollaborator ? '更新权限' : '发送邀请' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="cancelInvite">取消</button>
        </div>
      </div>

      <!-- Action Button -->
      <button v-if="!showInviteForm" class="btn btn-primary btn-sm mb-4" @click="showInviteForm = true">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        邀请协作者
      </button>

      <!-- Collaborators Table -->
      <div class="overflow-x-auto">
        <table class="table table-sm table-zebra">
          <thead>
            <tr>
              <th>协作者</th>
              <th>邮箱</th>
              <th>权限</th>
              <th>邀请时间</th>
              <th class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-8">
                <span class="loading loading-spinner loading-md"></span>
              </td>
            </tr>
            <tr v-else-if="collaborators.length === 0">
              <td colspan="5" class="text-center py-8 text-base-content/60">暂无协作者</td>
            </tr>
            <tr v-for="collaborator in collaborators" v-else :key="collaborator.id">
              <td>
                <div class="flex items-center gap-2">
                  <div class="avatar placeholder">
                    <div class="w-8 h-8 rounded-full bg-primary text-primary-content">
                      <span class="text-xs">{{ collaborator.user.name[0] }}</span>
                    </div>
                  </div>
                  <span>{{ collaborator.user.name }}</span>
                </div>
              </td>
              <td>{{ collaborator.user.email }}</td>
              <td>
                <div class="flex gap-1">
                  <span
                    v-for="permission in collaborator.permissions"
                    :key="permission"
                    :class="getPermissionBadgeClass(permission)"
                  >
                    {{ getPermissionText(permission) }}
                  </span>
                </div>
              </td>
              <td>{{ formatDate(collaborator.invitedAt) }}</td>
              <td class="text-center">
                <div class="flex justify-center gap-1">
                  <button class="btn btn-ghost btn-xs" @click="editCollaborator(collaborator)">
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
                  <button class="btn btn-ghost btn-xs text-error" @click="removeCollaborator(collaborator)">
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

      <!-- Info Alert -->
      <div role="alert" class="alert alert-soft alert-info mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="text-sm">
          <p><strong>权限说明：</strong></p>
          <p>
            •
            <strong>查看</strong>
            ：可以查看活动数据和统计信息
          </p>
          <p>
            •
            <strong>编辑</strong>
            ：可以编辑活动信息、管理参与者和辩题
          </p>
          <p>
            •
            <strong>控制</strong>
            ：可以控制活动流程、切换辩题、管理大屏
          </p>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Collaborator } from '@/types/api';
import { ActivitiesApi } from '@/api/activities';
import toast from '@/utils/toast';

interface Props {
  activityId: string;
  modalId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modalId: 'collaborator-modal',
});

const emit = defineEmits<{
  refresh: [];
}>();

// State
const collaborators = ref<Collaborator[]>([]);
const loading = ref(false);
const showInviteForm = ref(false);
const editingCollaborator = ref<Collaborator | null>(null);
const editingPermissions = ref<('view' | 'edit' | 'control')[]>([]);

const newCollaborator = ref({
  email: '',
  permissions: [] as ('view' | 'edit' | 'control')[],
});

// Methods
const loadCollaborators = async () => {
  console.log(`[CollaboratorModal] Loading collaborators for activity: ${props.activityId}`);
  try {
    loading.value = true;
    const response = await ActivitiesApi.getCollaborators(props.activityId);
    console.log(`[CollaboratorModal] API response:`, response);
    if (Array.isArray(response)) {
      collaborators.value = response;
      console.log(`[CollaboratorModal] Loaded ${collaborators.value.length} collaborators`);
    }
  } catch (error) {
    console.error(`[CollaboratorModal] Failed to load collaborators:`, error);
    toast.error('加载协作者列表失败');
    console.error('Failed to load collaborators:', error);
  } finally {
    loading.value = false;
  }
};

const inviteCollaborator = async () => {
  if (!newCollaborator.value.email) {
    toast.warning('请输入邮箱');
    return;
  }

  if (newCollaborator.value.permissions.length === 0) {
    toast.warning('请至少选择一项权限');
    return;
  }

  try {
    loading.value = true;
    const response = await ActivitiesApi.inviteCollaborator(props.activityId, newCollaborator.value);
    if (response) {
      toast.success('邀请协作者成功');
      await loadCollaborators();
      cancelInvite();
      emit('refresh');
    }
  } catch (error) {
    toast.error('邀请协作者失败');
    console.error('Failed to invite collaborator:', error);
  } finally {
    loading.value = false;
  }
};

const editCollaborator = async (collaborator: Collaborator) => {
  editingCollaborator.value = collaborator;
  editingPermissions.value = [...collaborator.permissions];
  showInviteForm.value = false;
};

const updateCollaboratorPermissions = async () => {
  if (!editingCollaborator.value) return;

  try {
    loading.value = true;
    await ActivitiesApi.updateCollaboratorPermissions(
      props.activityId,
      editingCollaborator.value.id,
      editingPermissions.value,
    );
    toast.success('更新协作者权限成功');
    await loadCollaborators();
    cancelInvite();
    emit('refresh');
  } catch (error) {
    toast.error('更新协作者权限失败');
    console.error('Failed to update collaborator permissions:', error);
  } finally {
    loading.value = false;
  }
};

const removeCollaborator = async (collaborator: Collaborator) => {
  if (!confirm(`确定要移除协作者 ${collaborator.user.name} 吗？`)) {
    return;
  }

  try {
    loading.value = true;
    const response = await ActivitiesApi.removeCollaborator(props.activityId, collaborator.id);
    if (response !== undefined) {
      toast.success('移除协作者成功');
      await loadCollaborators();
      emit('refresh');
    }
  } catch (error) {
    toast.error('移除协作者失败');
    console.error('Failed to remove collaborator:', error);
  } finally {
    loading.value = false;
  }
};

const cancelInvite = () => {
  showInviteForm.value = false;
  editingCollaborator.value = null;
  newCollaborator.value = {
    email: '',
    permissions: [],
  };
  editingPermissions.value = [];
};

const getPermissionText = (permission: string) => {
  const map: Record<string, string> = {
    view: '查看',
    edit: '编辑',
    control: '控制',
  };
  return map[permission] || permission;
};

const getPermissionBadgeClass = (permission: string) => {
  const baseClass = 'badge badge-sm';
  switch (permission) {
    case 'view':
      return `${baseClass} badge-ghost`;
    case 'edit':
      return `${baseClass} badge-primary`;
    case 'control':
      return `${baseClass} badge-accent`;
    default:
      return baseClass;
  }
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

// Load collaborators when mounted
onMounted(() => {
  loadCollaborators();
});

// Watch for activityId changes
watch(
  () => props.activityId,
  (newActivityId: string, oldActivityId: string) => {
    if (newActivityId && newActivityId !== oldActivityId) {
      console.log(
        `[CollaboratorModal] Activity changed from ${oldActivityId} to ${newActivityId}, clearing cache and reloading`,
      );
      // Clear current data when switching activities
      collaborators.value = [];
      showInviteForm.value = false;
      editingCollaborator.value = null;
      editingPermissions.value = [];
      newCollaborator.value = {
        email: '',
        permissions: [],
      };
      loadCollaborators();
    }
  },
);

// Modal ref
const modalRef = ref<HTMLDialogElement | null>(null);

// Modal control methods
const open = () => {
  modalRef.value?.showModal();
  loadCollaborators();
};

const close = () => {
  modalRef.value?.close();
  // Reset state on close
  showInviteForm.value = false;
  editingCollaborator.value = null;
  newCollaborator.value = {
    email: '',
    permissions: [],
  };
  editingPermissions.value = [];
};

// Watch for modal close events
const modalElement = ref<HTMLDialogElement>();
onMounted(() => {
  modalElement.value = document.getElementById(props.modalId) as HTMLDialogElement;
  if (modalElement.value) {
    modalElement.value.addEventListener('close', close);
  }
  loadCollaborators();
});

// Expose methods for parent component
defineExpose({
  loadCollaborators,
  open,
  close,
});
</script>
