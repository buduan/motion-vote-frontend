<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Activity Detail -->
    <div v-else-if="activity" class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button class="btn btn-ghost btn-sm" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 class="text-3xl font-bold">{{ activity.name }}</h1>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" @click="editActivity">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑活动
          </button>
        </div>
      </div>

      <!-- Activity Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Basic Info -->
        <div class="card card-border bg-base-100">
          <div class="card-body">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              基本信息
            </h3>
            <div class="space-y-2">
              <p><strong>描述：</strong>{{ activity.description || '暂无描述' }}</p>
              <p><strong>地点：</strong>{{ activity.location }}</p>
              <p><strong>状态：</strong>
                <span :class="getStatusBadgeClass(activity.status)">
                  {{ getStatusText(activity.status) }}
                </span>
              </p>
              <p><strong>创建者：</strong>{{ activity.owner?.name || '未知' }}</p>
            </div>
          </div>
        </div>

        <!-- Time Info -->
        <div class="card card-border bg-base-100">
          <div class="card-body">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              时间信息
            </h3>
            <div class="space-y-2">
              <p><strong>开始时间：</strong>{{ formatDateTime(activity.startTime) }}</p>
              <p><strong>结束时间：</strong>{{ formatDateTime(activity.endTime) }}</p>
              <p><strong>创建时间：</strong>{{ formatDateTime(activity.createdAt) }}</p>
              <p><strong>更新时间：</strong>{{ formatDateTime(activity.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="card card-border bg-base-100">
          <div class="card-body">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              统计信息
            </h3>
            <div class="space-y-2">
              <p><strong>预期参与者：</strong>{{ activity.expectedParticipants || 0 }}</p>
              <p><strong>实际参与者：</strong>{{ activity.currentParticipants }}</p>
              <p><strong>辩题数量：</strong>{{ activity.debates?.length || 0 }}</p>
              <p><strong>协作者数量：</strong>{{ activity.collaborators?.length || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="card card-border bg-base-100">
          <div class="card-body">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              活动设置
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm">允许改票</span>
                <span :class="activity.settings?.allowVoteChange ? 'badge badge-success' : 'badge badge-ghost'">
                  {{ activity.settings?.allowVoteChange ? '是' : '否' }}
                </span>
              </div>
              <div v-if="activity.settings?.allowVoteChange" class="flex items-center justify-between">
                <span class="text-sm">最大改票次数</span>
                <span class="badge badge-info">{{ activity.settings?.maxVoteChanges || '无限制' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm">显示实时结果</span>
                <span :class="activity.settings?.showRealTimeResults ? 'badge badge-success' : 'badge badge-ghost'">
                  {{ activity.settings?.showRealTimeResults ? '是' : '否' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm">需要入场验证</span>
                <span :class="activity.settings?.requireCheckIn ? 'badge badge-success' : 'badge badge-ghost'">
                  {{ activity.settings?.requireCheckIn ? '是' : '否' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm">匿名投票</span>
                <span :class="activity.settings?.anonymousVoting ? 'badge badge-success' : 'badge badge-ghost'">
                  {{ activity.settings?.anonymousVoting ? '是' : '否' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm">自动锁定投票</span>
                <span :class="activity.settings?.autoLockVotes ? 'badge badge-success' : 'badge badge-ghost'">
                  {{ activity.settings?.autoLockVotes ? '是' : '否' }}
                </span>
              </div>
              <div v-if="activity.settings?.autoLockVotes" class="flex items-center justify-between">
                <span class="text-sm">锁定延迟时间</span>
                <span class="badge badge-info">{{ activity.settings?.lockVoteDelay || 0 }}秒</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debates Section -->
      <div class="card card-border bg-base-100 mb-6">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              辩题列表
            </h3>
            <button class="btn btn-outline btn-sm" @click="manageDebates">
              管理辩题
            </button>
          </div>
          <div v-if="activity.debates && activity.debates.length > 0" class="space-y-2">
            <div v-for="debate in activity.debates" :key="debate.id" class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="font-medium">{{ debate.title }}</span>
                <span :class="getDebateStatusBadgeClass(debate.status)">
                  {{ getDebateStatusText(debate.status) }}
                </span>
              </div>
              <div class="text-sm text-base-content/60">
                {{ formatDateTime(debate.createdAt) }}
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-base-content/60">
            暂无辩题
          </div>
        </div>
      </div>

      <!-- Collaborators Section -->
      <div class="card card-border bg-base-100 mb-6">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              协作者列表
            </h3>
            <button class="btn btn-outline btn-sm" @click="manageCollaborators">
              管理协作者
            </button>
          </div>
          <div v-if="activity.collaborators && activity.collaborators.length > 0" class="space-y-2">
            <div v-for="collaborator in activity.collaborators" :key="collaborator.id" class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="w-8 h-8 rounded-full bg-primary text-primary-content">
                    <span class="text-xs">{{ collaborator.user.name[0] }}</span>
                  </div>
                </div>
                <div>
                  <div class="font-medium">{{ collaborator.user.name }}</div>
                  <div class="text-sm text-base-content/60">{{ collaborator.user.email }}</div>
                </div>
              </div>
              <div class="flex gap-1">
                <span v-for="permission in collaborator.permissions" :key="permission" class="badge badge-sm badge-primary">
                  {{ getPermissionText(permission) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-base-content/60">
            暂无协作者
          </div>
        </div>
      </div>

      <!-- Participants Section -->
      <div class="card card-border bg-base-100">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              参与者列表
            </h3>
            <button class="btn btn-outline btn-sm" @click="manageParticipants">
              管理参与者
            </button>
          </div>
          <div v-if="activity.participants && activity.participants.length > 0" class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>编号</th>
                  <th>姓名</th>
                  <th>手机号</th>
                  <th>入场状态</th>
                  <th>入场时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="participant in activity.participants.slice(0, 10)" :key="participant.id">
                  <td>{{ participant.code }}</td>
                  <td>{{ participant.name || '-' }}</td>
                  <td>{{ participant.phone || '-' }}</td>
                  <td>
                    <span v-if="participant.checkedIn" class="badge badge-success badge-sm">已入场</span>
                    <span v-else class="badge badge-ghost badge-sm">未入场</span>
                  </td>
                  <td>{{ participant.checkedInAt ? formatDateTime(participant.checkedInAt) : '-' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="activity.participants.length > 10" class="text-center mt-4">
              <span class="text-sm text-base-content/60">显示前10个参与者，共{{ activity.participants.length }}个</span>
            </div>
          </div>
          <div v-else class="text-center py-8 text-base-content/60">
            暂无参与者
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex flex-col items-center justify-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-error mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 class="text-xl font-semibold mb-2">加载失败</h3>
      <p class="text-base-content/60 mb-4">{{ error }}</p>
      <button class="btn btn-primary" @click="loadActivity">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { ActivityDetail } from '@/types/api';
import { ActivitiesApi } from '@/api/activities';

const router = useRouter();
const route = useRoute();

const activity = ref<ActivityDetail | null>(null);
const loading = ref(false);
const error = ref('');

const loadActivity = async () => {
  try {
    loading.value = true;
    error.value = '';
    const activityId = route.params.id as string;
    console.log(`[DEBUG] Loading activity detail for ID: ${activityId}`);
    const response = await ActivitiesApi.getActivityById(activityId);
    console.log(`[DEBUG] ActivityDetail API response:`, response);
    activity.value = response;
    console.log(`[DEBUG] Activity loaded:`, activity.value?.name);
  } catch (err: any) {
    error.value = err.message || '加载活动详情失败';
    console.error(`[DEBUG] Failed to load activity:`, err);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/admin/activities');
};

const editActivity = () => {
  router.push(`/admin/activities/${activity.value?.id}/edit`);
};

const manageDebates = () => {
  router.push(`/admin/activities/${activity.value?.id}/debates`);
};

const manageCollaborators = () => {
  router.push(`/admin/activities/${activity.value?.id}/collaborators`);
};

const manageParticipants = () => {
  router.push(`/admin/activities/${activity.value?.id}/participants`);
};

const getStatusBadgeClass = (status: string) => {
  const baseClass = 'badge badge-sm';
  switch (status) {
    case 'upcoming':
      return `${baseClass} badge-info`;
    case 'ongoing':
      return `${baseClass} badge-success`;
    case 'ended':
      return `${baseClass} badge-neutral`;
    default:
      return baseClass;
  }
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    upcoming: '未开始',
    ongoing: '进行中',
    ended: '已结束',
  };
  return statusMap[status] || status;
};

const getDebateStatusBadgeClass = (status: string) => {
  const baseClass = 'badge badge-sm';
  switch (status) {
    case 'pending':
      return `${baseClass} badge-warning`;
    case 'ongoing':
      return `${baseClass} badge-success`;
    case 'completed':
      return `${baseClass} badge-neutral`;
    default:
      return baseClass;
  }
};

const getDebateStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待开始',
    ongoing: '进行中',
    completed: '已完成',
  };
  return statusMap[status] || status;
};

const getPermissionText = (permission: string) => {
  const permissionMap: Record<string, string> = {
    view: '查看',
    edit: '编辑',
    control: '控制',
  };
  return permissionMap[permission] || permission;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadActivity();
});
</script>
