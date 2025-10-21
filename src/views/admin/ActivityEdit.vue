<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button class="btn btn-ghost btn-sm" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 class="text-3xl font-bold">编辑活动</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Activity Edit -->
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
          <h1 class="text-3xl font-bold">编辑活动</h1>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" @click="updateActivity" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-sm mr-2"></span>
            保存修改
          </button>
        </div>
      </div>

      <!-- Edit Form Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Basic Information -->
        <div class="card card-border bg-base-100">
          <div class="card-body">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              基本信息
            </h3>
            <div class="space-y-4">
              <label class="input">
                <span class="label">活动名称 *</span>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="请输入活动名称"
                  class="input input-bordered"
                  required
                />
              </label>

              <label class="textarea">
                <span class="label">活动描述</span>
                <textarea
                  v-model="form.description"
                  placeholder="请输入活动描述"
                  class="textarea textarea-bordered"
                  rows="3"
                ></textarea>
              </label>

              <label class="input">
                <span class="label">活动地点 *</span>
                <input
                  v-model="form.location"
                  type="text"
                  placeholder="请输入活动地点"
                  class="input input-bordered"
                  required
                />
              </label>

              <label class="input">
                <span class="label">预期参与者数量</span>
                <input
                  v-model.number="form.expectedParticipants"
                  type="number"
                  placeholder="请输入预期参与者数量"
                  class="input input-bordered"
                  min="0"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- Time Information -->
        <div class="card card-border bg-base-100">
          <div class="card-body">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              时间信息
            </h3>
            <div class="space-y-4">
              <label class="input">
                <span class="label">开始时间 *</span>
                <input
                  v-model="form.startTime"
                  type="datetime-local"
                  class="input input-bordered"
                  required
                />
              </label>

              <label class="input">
                <span class="label">结束时间 *</span>
                <input
                  v-model="form.endTime"
                  type="datetime-local"
                  class="input input-bordered"
                  required
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Tags Section -->
      <div class="card card-border bg-base-100 mb-6">
        <div class="card-body">
          <h3 class="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            标签
          </h3>
          <div class="space-y-4">
            <div class="flex gap-2">
              <input
                v-model="newTag"
                type="text"
                placeholder="添加标签"
                class="input input-bordered flex-1"
                @keydown.enter.prevent="addTag"
              />
              <button type="button" class="btn btn-outline" @click="addTag">
                添加
              </button>
            </div>
            <div v-if="form.tags && form.tags.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in form.tags"
                :key="index"
                class="badge badge-primary gap-2"
              >
                {{ tag }}
                <button type="button" @click="removeTag(index)" class="btn btn-ghost btn-xs">
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Section -->
      <div class="card card-border bg-base-100">
        <div class="card-body">
          <h3 class="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            活动设置
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">允许改票</span>
                <p class="text-sm text-base-content/60">允许参与者在投票后修改选择</p>
              </div>
              <input
                v-model="form.settings.allowVoteChange"
                type="checkbox"
                class="toggle toggle-primary"
              />
            </div>

            <div v-if="form.settings.allowVoteChange" class="ml-4">
              <label class="input">
                <span class="label">最大改票次数</span>
                <input
                  v-model.number="form.settings.maxVoteChanges"
                  type="number"
                  placeholder="留空表示无限制"
                  class="input input-bordered input-sm"
                  min="1"
                />
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">显示实时结果</span>
                <p class="text-sm text-base-content/60">在投票过程中显示实时统计结果</p>
              </div>
              <input
                v-model="form.settings.showRealTimeResults"
                type="checkbox"
                class="toggle toggle-primary"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">需要入场验证</span>
                <p class="text-sm text-base-content/60">参与者需要验证入场后才能投票</p>
              </div>
              <input
                v-model="form.settings.requireCheckIn"
                type="checkbox"
                class="toggle toggle-primary"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">匿名投票</span>
                <p class="text-sm text-base-content/60">隐藏投票者的身份信息</p>
              </div>
              <input
                v-model="form.settings.anonymousVoting"
                type="checkbox"
                class="toggle toggle-primary"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">自动锁定投票</span>
                <p class="text-sm text-base-content/60">在辩题结束后自动锁定投票</p>
              </div>
              <input
                v-model="form.settings.autoLockVotes"
                type="checkbox"
                class="toggle toggle-primary"
              />
            </div>

            <div v-if="form.settings.autoLockVotes" class="ml-4">
              <label class="input">
                <span class="label">锁定延迟时间（秒）</span>
                <input
                  v-model.number="form.settings.lockVoteDelay"
                  type="number"
                  placeholder="延迟时间"
                  class="input input-bordered input-sm"
                  min="0"
                />
              </label>
            </div>
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
import type { ActivityDetail, CreateActivityRequest } from '@/types/api';
import { ActivitiesApi } from '@/api/activities';
import toast from '@/utils/toast';

const router = useRouter();
const route = useRoute();

const activity = ref<ActivityDetail | null>(null);
const loading = ref(false);
const submitting = ref(false);
const error = ref('');
const newTag = ref('');

const form = ref<CreateActivityRequest>({
  name: '',
  description: '',
  location: '',
  startTime: '',
  endTime: '',
  expectedParticipants: undefined,
  tags: [],
  settings: {
    allowVoteChange: false,
    maxVoteChanges: undefined,
    showRealTimeResults: false,
    requireCheckIn: false,
    anonymousVoting: false,
    autoLockVotes: false,
    lockVoteDelay: undefined,
  },
});

const loadActivity = async () => {
  try {
    loading.value = true;
    error.value = '';
    const activityId = route.params.id as string;
    console.log(`[DEBUG] Loading activity for edit, ID: ${activityId}`);
    const response = await ActivitiesApi.getActivityById(activityId);
    console.log(`[DEBUG] ActivityEdit load API response:`, response);
    activity.value = response;

    // Populate form with existing data
    form.value = {
      name: response.name,
      description: response.description || '',
      location: response.location,
      startTime: formatDateTimeForInput(response.startTime),
      endTime: formatDateTimeForInput(response.endTime),
      expectedParticipants: response.expectedParticipants,
      tags: response.tags || [],
      settings: response.settings || {
        allowVoteChange: false,
        maxVoteChanges: undefined,
        showRealTimeResults: false,
        requireCheckIn: false,
        anonymousVoting: false,
        autoLockVotes: false,
        lockVoteDelay: undefined,
      },
    };
    console.log(`[DEBUG] Activity form populated:`, form.value.name);
  } catch (err: any) {
    error.value = err.message || '加载活动信息失败';
    console.error(`[DEBUG] Failed to load activity for edit:`, err);
  } finally {
    loading.value = false;
  }
};

const updateActivity = async () => {
  if (!activity.value) return;

  try {
    submitting.value = true;

    // Validate required fields
    if (!form.value.name.trim()) {
      toast.error('请输入活动名称');
      return;
    }
    if (!form.value.location.trim()) {
      toast.error('请输入活动地点');
      return;
    }
    if (!form.value.startTime || !form.value.endTime) {
      toast.error('请选择开始时间和结束时间');
      return;
    }

    // Validate time
    const startTime = new Date(form.value.startTime);
    const endTime = new Date(form.value.endTime);
    if (startTime >= endTime) {
      toast.error('结束时间必须晚于开始时间');
      return;
    }

    const updateData: Partial<CreateActivityRequest> = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || undefined,
      location: form.value.location.trim(),
      startTime: form.value.startTime,
      endTime: form.value.endTime,
      expectedParticipants: form.value.expectedParticipants || undefined,
      tags: form.value.tags?.length ? form.value.tags : undefined,
      settings: form.value.settings,
    };

    console.log(`[DEBUG] Updating activity ${activity.value.id} with data:`, updateData);
    await ActivitiesApi.updateActivity(activity.value.id, updateData);
    console.log(`[DEBUG] Activity update successful`);

    toast.success('活动更新成功');
    router.push(`/admin/activities/${activity.value.id}`);
  } catch (err: any) {
    console.error(`[DEBUG] Failed to update activity:`, err);
    toast.error(err.message || '更新活动失败');
  } finally {
    submitting.value = false;
  }
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && (!form.value.tags || !form.value.tags.includes(tag))) {
    if (!form.value.tags) {
      form.value.tags = [];
    }
    form.value.tags.push(tag);
    newTag.value = '';
  }
};

const removeTag = (index: number) => {
  if (form.value.tags) {
    form.value.tags.splice(index, 1);
  }
};

const goBack = () => {
  if (activity.value) {
    router.push(`/admin/activities/${activity.value.id}`);
  } else {
    router.push('/admin/activities');
  }
};

const formatDateTimeForInput = (dateString: string) => {
  const date = new Date(dateString);
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

onMounted(() => {
  loadActivity();
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
